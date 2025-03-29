import React, { useState } from "react";
import { CheckSquare, Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isValid, parseISO } from "date-fns";

interface TaskSectionProps {
  tasks: Task[];
  isLoading: boolean;
  onToggleTask: (id: number) => void;
  onAddTask?: (text: string) => void;
}

export default function TaskSection({ tasks, isLoading, onToggleTask, onAddTask }: TaskSectionProps) {
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");

  const handleAddTask = () => {
    if (newTaskText.trim() && onAddTask) {
      onAddTask(newTaskText.trim());
      setNewTaskText("");
      setShowNewTaskForm(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    } else if (e.key === 'Escape') {
      setShowNewTaskForm(false);
      setNewTaskText("");
    }
  };

  return (
    <div className="border border-border">
      <div className="flex justify-between items-center px-4 py-2 border-b border-border">
        <div className="flex items-center gap-4">
          <CheckSquare className="w-5 h-5" />
          <span className="font-medium">Tasks</span>
        </div>
        <Button 
          variant="outline"
          className="h-7 w-7 p-0 rounded-none bg-background"
          onClick={() => setShowNewTaskForm(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="h-64 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <table className="w-full table-auto"> {/* Changed to table-auto for responsiveness */}
          <tbody>
            {isLoading ? (
              // Loading state
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className={index < 3 ? "border-b border-border" : ""}>
                  <td className="p-4">
                    {index + 1}. <Skeleton className="h-4 w-[90%] inline-block bg-muted rounded-none" />
                  </td>
                </tr>
              ))
            ) : (
              <>
                {/* Tasks list */}
                {[...tasks]
                  // Sort by completion status first (active first), then by creation date (newest first)
                  .sort((a, b) => {
                    // First sort by completion status
                    if (a.completed !== b.completed) {
                      return Number(a.completed) - Number(b.completed);
                    }
                    // Then sort by creation date (newest first)
                    // Handle missing createdAt values
                    const dateA = a.createdAt && isValid(parseISO(a.createdAt)) ? 
                      parseISO(a.createdAt).getTime() : 0;
                    const dateB = b.createdAt && isValid(parseISO(b.createdAt)) ? 
                      parseISO(b.createdAt).getTime() : 0;
                    return dateB - dateA;
                  })
                  .map((task, index) => (
                    <tr key={task.id} className={index < tasks.length - 1 || showNewTaskForm ? "border-b border-border" : ""}>
                      <td
                        className={`p-4 cursor-pointer transition-all duration-150 ease-in-out ${
                          task.completed ? "line-through opacity-70" : ""
                        }`}
                        onClick={() => onToggleTask(task.id)}
                      >
                        <div className="flex flex-col">
                          <div className="break-words">{index + 1}. {task.text}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {task.createdAt && isValid(parseISO(task.createdAt)) 
                              ? format(parseISO(task.createdAt), "d MMM ''yy") 
                              : ""}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}

                {/* New task input row */}
                {showNewTaskForm && (
                  <tr>
                    <td className="p-4">
                      <div className="flex flex-col w-full">
                        <div className="flex items-center">
                          <span className="whitespace-nowrap">{tasks.length + 1}. </span>
                          <input
                            type="text"
                            autoFocus
                            className="flex-1 bg-transparent border border-border text-foreground rounded-none outline-none px-2 py-1 mx-2"
                            placeholder="Type new task here..."
                            value={newTaskText}
                            onChange={(e) => setNewTaskText(e.target.value)}
                            onKeyDown={handleKeyDown}
                          />
                        </div>
                        <div className="flex mt-2 ml-6">
                          <Button 
                            variant="outline"
                            className="h-6 w-6 p-0 mr-3 bg-background text-primary rounded-none"
                            onClick={handleAddTask}
                            disabled={!newTaskText.trim()}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline"
                            className="h-6 w-6 p-0 bg-background text-destructive rounded-none"
                            onClick={() => {
                              setShowNewTaskForm(false);
                              setNewTaskText("");
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}