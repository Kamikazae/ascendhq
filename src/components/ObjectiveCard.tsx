"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface KeyResult {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  dueDate: string;
}

interface Objective {
  id: string;
  title: string;
  description: string;
  status: string;
  keyResults: KeyResult[];
}

export default function ObjectiveCard({ objective }: { objective: Objective }) {
  const [keyResults, setKeyResults] = useState(objective.keyResults);
  const [showForm, setShowForm] = useState(false);
  const [krTitle, setKrTitle] = useState("");
  const [krTarget, setKrTarget] = useState("");
  const [krDue, setKrDue] = useState("");

  const addKeyResult = async () => {
    const res = await fetch("/api/key-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objectiveId: objective.id,
        title: krTitle,
        targetValue: parseFloat(krTarget),
        dueDate: krDue,
      }),
    });
    const newKR = await res.json();
    setKeyResults([...keyResults, newKR]);
    setKrTitle("");
    setKrTarget("");
    setKrDue("");
    setShowForm(false);
  };

  const updateProgress = async (krId: string, value: string | number) => {
    const res = await fetch(`/api/key-results/${krId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentValue: parseFloat(value as string) }),
    });
    const updatedKR = await res.json();
    setKeyResults(keyResults.map(kr => kr.id === krId ? updatedKR : kr));
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">{objective.title}</h3>
            <p className="text-sm text-gray-600">{objective.description}</p>
          </div>
          <span className="text-sm text-gray-500">{objective.status}</span>
        </div>

        {/* Key Results List */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold">Key Results</h4>
          {keyResults.length === 0 && (
            <p className="text-gray-500 text-sm">No key results yet</p>
          )}
          {keyResults.map((kr) => (
            <div key={kr.id} className="flex items-center justify-between my-2">
              <span>
                {kr.title} ({kr.currentValue}/{kr.targetValue})
              </span>
              <input
                type="number"
                defaultValue={kr.currentValue}
                onBlur={(e) => updateProgress(kr.id, e.target.value)}
                className="border p-1 rounded w-20 text-sm"
              />
            </div>
          ))}
        </div>

        {/* Add KR Form */}
        {showForm ? (
          <div className="mt-3 space-y-2">
            <input
              type="text"
              placeholder="Key Result Title"
              value={krTitle}
              onChange={(e) => setKrTitle(e.target.value)}
              className="border p-1 rounded w-full text-sm"
            />
            <input
              type="number"
              placeholder="Target Value"
              value={krTarget}
              onChange={(e) => setKrTarget(e.target.value)}
              className="border p-1 rounded w-full text-sm"
            />
            <input
              type="date"
              value={krDue}
              onChange={(e) => setKrDue(e.target.value)}
              className="border p-1 rounded w-full text-sm"
            />
            <Button size="sm" onClick={addKeyResult}>
              Save
            </Button>
          </div>
        ) : (
          <Button
            variant="link"
            size="sm"
            className="mt-2 p-0"
            onClick={() => setShowForm(true)}
          >
            + Add Key Result
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
