# Design Document

## Overview

The member dashboard API will be implemented as a Next.js API route at `/api/member/dashboard` that provides member-specific statistics by querying the database for objectives, teams, and progress data. The API will follow the existing authentication and database patterns established in the codebase.

## Architecture

The API follows a simple request-response pattern:

```
Client Request → Authentication Check → Database Queries → Data Aggregation → JSON Response
```

### Key Components:
- **Authentication Layer**: Uses NextAuth session validation
- **Database Layer**: Prisma ORM with PostgreSQL
- **Data Aggregation**: Server-side calculations for progress metrics
- **Response Formatting**: Structured JSON matching frontend expectations

## Components and Interfaces

### API Endpoints

#### Dashboard Endpoint
- **Route**: `GET /api/member/dashboard`
- **Authentication**: Required (MEMBER role)
- **Response Format**:
```typescript
interface DashboardResponse {
  objectives: number;
  completed: number;
  teams: number;
  progress: number;
}
```

#### My Objectives Endpoint
- **Route**: `GET /api/member/my-objectives`
- **Authentication**: Required (MEMBER role)
- **Response Format**:
```typescript
interface MyObjectivesResponse {
  objectives: Array<{
    id: string;
    title: string;
    description: string;
    progress: number;
    teamId: string;
    teamName: string;
    keyResults: Array<{
      id: string;
      title: string;
      progress: number;
      target: number;
      current: number;
    }>;
  }>;
}
```

#### My Teams Endpoint
- **Route**: `GET /api/member/my-teams`
- **Authentication**: Required (MEMBER role)
- **Response Format**:
```typescript
interface MyTeamsResponse {
  teams: Array<{
    id: string;
    name: string;
    description: string;
    memberCount: number;
    objectiveCount: number;
    members: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
    }>;
  }>;
}
```

### Database Queries

#### Dashboard Queries
The dashboard API will execute optimized queries to gather:

1. **Objectives Count**: Count of objectives for teams where user is a member
2. **Completed Objectives**: Count of objectives with 100% progress
3. **Teams Count**: Count of teams where user is a member
4. **Progress Calculation**: Average progress across all key results in user's objectives

#### My Objectives Queries
The my-objectives API will query:

1. **User Objectives**: All objectives from teams where user is a member
2. **Key Results**: Associated key results with progress data
3. **Team Information**: Team names and details for context

#### My Teams Queries
The my-teams API will query:

1. **User Teams**: All teams where user is a member
2. **Team Members**: Other members in each team
3. **Team Statistics**: Objective counts and other metrics

### Query Strategies

#### Dashboard Query Strategy
```sql
-- Single query with joins to get all necessary data
SELECT 
  objectives.*,
  key_results.*,
  teams.*
FROM objectives
JOIN teams ON objectives.team_id = teams.id
JOIN team_members ON teams.id = team_members.team_id
LEFT JOIN key_results ON objectives.id = key_results.objective_id
WHERE team_members.user_id = ?
```

#### My Objectives Query Strategy
```sql
-- Get detailed objectives with key results
SELECT 
  objectives.*,
  teams.name as team_name,
  key_results.*
FROM objectives
JOIN teams ON objectives.team_id = teams.id
JOIN team_members ON teams.id = team_members.team_id
LEFT JOIN key_results ON objectives.id = key_results.objective_id
WHERE team_members.user_id = ?
ORDER BY objectives.created_at DESC
```

#### My Teams Query Strategy
```sql
-- Get teams with member information
SELECT 
  teams.*,
  team_members.*,
  users.name,
  users.email,
  COUNT(objectives.id) as objective_count
FROM teams
JOIN team_members ON teams.id = team_members.team_id
LEFT JOIN users ON team_members.user_id = users.id
LEFT JOIN objectives ON teams.id = objectives.team_id
WHERE teams.id IN (
  SELECT team_id FROM team_members WHERE user_id = ?
)
GROUP BY teams.id, team_members.id, users.id
```

## Data Models

### Input Data
- **User ID**: Extracted from authenticated session
- **Session**: NextAuth session object containing user role and ID

### Output Data

#### Dashboard Output
```typescript
interface MemberDashboardStats {
  objectives: number;        // Total objectives across user's teams
  completed: number;         // Objectives with 100% completion
  teams: number;            // Number of teams user belongs to
  progress: number;         // Overall progress percentage (0-100)
}
```

#### My Objectives Output
```typescript
interface ObjectiveWithDetails {
  id: string;
  title: string;
  description: string;
  progress: number;          // Calculated from key results
  teamId: string;
  teamName: string;
  keyResults: KeyResultData[];
}

interface KeyResultData {
  id: string;
  title: string;
  progress: number;          // 0-100 percentage
  target: number;
  current: number;
}
```

#### My Teams Output
```typescript
interface TeamWithMembers {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  objectiveCount: number;
  members: TeamMemberData[];
}

interface TeamMemberData {
  id: string;
  name: string;
  email: string;
  role: string;             // Team role (member, lead, etc.)
}
```

### Progress Calculation Logic
```typescript
// For each objective:
// 1. Calculate average progress of all key results
// 2. Objective is "completed" if average >= 100%
// 3. Overall progress = average of all objective progress values
```

## Error Handling

### Authentication Errors
- **401 Unauthorized**: No valid session
- **403 Forbidden**: User is not a MEMBER (wrong role)

### Database Errors
- **500 Internal Server Error**: Database connection issues
- **500 Internal Server Error**: Query execution failures

### Error Response Format
```typescript
interface ErrorResponse {
  error: string;
  message?: string;
}
```

## Testing Strategy

### Unit Tests
- **Authentication validation**: Test session checking logic
- **Progress calculation**: Test mathematical calculations with various scenarios
- **Database queries**: Test query logic with mock data
- **Error handling**: Test all error scenarios

### Integration Tests
- **End-to-end API calls**: Test complete request-response cycle
- **Database integration**: Test with real database queries
- **Authentication flow**: Test with actual NextAuth sessions

### Test Scenarios
1. **Valid member request**: Returns correct statistics
2. **Unauthenticated request**: Returns 401 error
3. **Non-member role**: Returns 403 error
4. **Member with no teams**: Returns zeros appropriately
5. **Member with mixed progress**: Calculates averages correctly
6. **Database error**: Returns 500 with appropriate message

## Performance Considerations

### Database Optimization
- Use single query with joins instead of multiple queries
- Index on `team_members.user_id` for efficient filtering
- Index on `objectives.team_id` for join performance

### Caching Strategy
- Consider implementing Redis caching for frequently accessed data
- Cache invalidation on objective/progress updates
- Short TTL (5-10 minutes) for dashboard data

### Query Efficiency

#### Dashboard Query Optimization
```typescript
// Optimized single query approach for dashboard stats
const userObjectives = await prisma.objective.findMany({
  where: {
    team: {
      members: {
        some: { userId: session.user.id }
      }
    }
  },
  include: {
    keyResults: true,
    team: {
      include: {
        members: {
          where: { userId: session.user.id }
        }
      }
    }
  }
});
```

#### My Objectives Query Optimization
```typescript
// Get detailed objectives with key results
const userObjectives = await prisma.objective.findMany({
  where: {
    team: {
      members: {
        some: { userId: session.user.id }
      }
    }
  },
  include: {
    keyResults: {
      orderBy: { createdAt: 'asc' }
    },
    team: {
      select: { id: true, name: true }
    }
  },
  orderBy: { createdAt: 'desc' }
});
```

#### My Teams Query Optimization
```typescript
// Get teams with member details and statistics
const userTeams = await prisma.team.findMany({
  where: {
    members: {
      some: { userId: session.user.id }
    }
  },
  include: {
    members: {
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    },
    _count: {
      select: { objectives: true }
    }
  }
});
```

## Security Considerations

### Data Access Control
- Verify user can only access their own team data
- No exposure of other members' individual progress
- Session validation on every request

### Input Validation
- Validate session structure and required fields
- Sanitize any potential query parameters (none expected for this endpoint)

### Rate Limiting
- Consider implementing rate limiting for dashboard API calls
- Prevent abuse of expensive database queries