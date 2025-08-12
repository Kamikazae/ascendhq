"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function NewObjectivePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/objectives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamId: params.id,
        title,
        description,
      }),
    });

    if (res.ok) {
      router.push(`/teams/${params.id}`);
    } else {
      console.error("Failed to create objective");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Add Objective</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Objective title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
        <Textarea
          placeholder="Objective description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Objective"}
        </Button>
      </form>
    </div>
  );
}
