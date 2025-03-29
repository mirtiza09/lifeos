"use client"

import * as React from "react"
import { Heart, Rocket, Briefcase, User, Check, X, Plus, Minus, Moon, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [tasks, setTasks] = React.useState([
    { text: "Buy Shampoo + Laundry + Tissues + Supplement", completed: false },
    { text: "Do Laundry", completed: false },
    { text: "Website Finalise", completed: false },
    { text: "Buy Nailcutter", completed: false },
  ])

  const toggleTask = (index: number) => {
    setTasks(tasks.map((task, i) => (i === index ? { ...task, completed: !task.completed } : task)))
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10">
            <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 19.5H22L12 2Z" />
            </svg>
          </div>
          <h1 className="text-xl tracking-wide">Life OS</h1>
        </div>
        <div className="flex items-center">
          <Moon className="w-6 h-6" />
          <span className="text-xl ml-1">+</span>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
        <div className="lg:col-span-2 space-y-8">
          {/* Tasks Section */}
          <div className="border border-white">
            <div className="flex justify-between items-center px-4 py-2 border-b border-white">
              <div className="flex items-center gap-4">
                <CheckSquare className="w-5 h-5" />
                <span className="font-medium">Tasks</span>
              </div>
              <Button variant="ghost" className="h-8 w-8 p-0 text-white">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white">
                  <th className="text-left p-4 font-normal underline w-24">S.No</th>
                  <th className="text-left p-4 font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr key={index} className={index < 3 ? "border-b border-white" : ""}>
                    <td className="p-4">{index + 1}</td>
                    <td
                      className={`p-4 cursor-pointer ${task.completed ? "line-through" : ""}`}
                      onClick={() => toggleTask(index)}
                    >
                      {task.text}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Habits Section */}
          <div className="border border-white">
            <div className="flex justify-between items-center px-4 py-2 border-b border-white">
              <div className="flex items-center gap-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <span className="font-medium">Habits</span>
              </div>
              <Button variant="ghost" className="h-8 w-8 p-0 text-white">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <table className="w-full">
              <tbody>
                <tr className="border-b border-white">
                  <td className="p-4">One</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-4">
                      <div className="w-6 h-6 border border-white rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="w-6 h-6 border border-white rounded-full flex items-center justify-center">
                        <X className="w-4 h-4" />
                      </div>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-white">
                  <td className="p-4">Namaz</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-4">
                      <div className="w-6 h-6 border border-white rounded-full flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div className="w-6 h-6 border border-white rounded-full flex items-center justify-center">
                        <Minus className="w-4 h-4" />
                      </div>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-white">
                  <td className="p-4">Conscious Eating</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-4">
                      <div className="w-6 h-6 border border-white rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="w-6 h-6 border border-white rounded-full flex items-center justify-center">
                        <X className="w-4 h-4" />
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="p-4">Exercise</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-4">
                      <div className="w-6 h-6 border border-white rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                      <div className="w-6 h-6 border border-white rounded-full flex items-center justify-center">
                        <X className="w-4 h-4" />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Health Box */}
          <div className="border border-white aspect-square flex flex-col items-center justify-center">
            <Heart className="w-10 h-10 mb-4" />
            <span>Health</span>
          </div>

          {/* Career Box */}
          <div className="border border-white aspect-square flex flex-col items-center justify-center">
            <Rocket className="w-10 h-10 mb-4" />
            <span>Career</span>
          </div>

          {/* Finances Box */}
          <div className="border border-white aspect-square flex flex-col items-center justify-center">
            <Briefcase className="w-10 h-10 mb-4" />
            <span>Finances</span>
          </div>

          {/* Personal Box */}
          <div className="border border-white aspect-square flex flex-col items-center justify-center">
            <User className="w-10 h-10 mb-4" />
            <span>Personal</span>
          </div>
        </div>
      </main>
    </div>
  )
}

