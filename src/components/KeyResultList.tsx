"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

type KeyResult = {
  id: string | number;
  title: string;
  progress: number;
};

interface KeyResultsListProps {
  objectiveId: string | number;
  initialKeyResults: KeyResult[];
}

export default function KeyResultsList({ objectiveId, initialKeyResults }: KeyResultsListProps) {
  const [keyResults, setKeyResults] = useState(initialKeyResults || []);
  const [newTitle, setNewTitle] = useState("");

  async function handleAddKeyResult() {
    if (!newTitle.trim()) return;
    const res = await fetch(`/api/objectives/${objectiveId}/key-results`, {
      method: "POST",
      body: JSON.stringify({ title: newTitle }),
    });
    if (res.ok) {
      const created = await res.json();
      setKeyResults([...keyResults, created]);
      setNewTitle("");
    }
  }

interface HandleProgressChangeParams {
    id: string | number;
    newProgress: number;
}

async function handleProgressChange(
    id: HandleProgressChangeParams["id"],
    newProgress: HandleProgressChangeParams["newProgress"]
): Promise<void> {
    const res = await fetch(`/api/key-results/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ progress: newProgress }),
    });
    if (res.ok) {
        setKeyResults(
            keyResults.map((kr: KeyResult) =>
                kr.id === id ? { ...kr, progress: newProgress } : kr
            )
        );
    }
}

  return (
    <div className="space-y-4">
      {/* List of key results */}
      {keyResults.map((kr) => (
        <div
          key={kr.id}
          className="flex items-center justify-between bg-muted p-3 rounded-md"
        >
          <div>
            <p className="font-medium">{kr.title}</p>
            <Progress value={kr.progress} className="w-48 mt-1" />
          </div>
          <Input
            type="number"
            min={0}
            max={100}
            value={kr.progress}
            onChange={(e) =>
              handleProgressChange(kr.id, parseInt(e.target.value, 10))
            }
            className="w-20"
          />
        </div>
      ))}

      {/* Add new key result */}
      <div className="flex gap-2">
        <Input
          placeholder="New Key Result"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <Button onClick={handleAddKeyResult}>Add</Button>
      </div>
    </div>
  );
}
