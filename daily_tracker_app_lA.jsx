import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudRain, Sun, Clock, Calendar, ListTodo } from "lucide-react";

export default function Dashboard() {
  const [time, setTime] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [weather, setWeather] = useState(null);

  // update clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // fetch weather (using Open-Meteo API - hourly forecast)
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=precipitation_probability,precipitation&timezone=auto`
      )
        .then((res) => res.json())
        .then((data) => setWeather(data));
    });
  }, []);

  // task handler
  const addTask = () => {
    if (newTask.trim() !== "") {
      setTasks([
        ...tasks,
        { text: newTask, done: false, createdAt: new Date() },
      ]);
      setNewTask("");
    }
  };

  const toggleTask = (index) => {
    const updated = [...tasks];
    updated[index].done = !updated[index].done;
    updated[index].completedAt = updated[index].done ? new Date() : null;
    setTasks(updated);
  };

  // format date to DD-MM-YY
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  // find next rain hour if any
  const getNextRain = () => {
    if (!weather) return null;
    const hours = weather.hourly.time;
    const precip = weather.hourly.precipitation;
    for (let i = 0; i < hours.length; i++) {
      if (precip[i] > 0) {
        return new Date(hours[i]);
      }
    }
    return null;
  };

  const nextRain = getNextRain();

  return (
    <div className="p-6 grid gap-6">
      {/* Header Row with Date & Weather */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Date & Time */}
        <Card className="shadow-xl rounded-2xl p-4">
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              <h2 className="text-xl font-bold">{formatDate(time)}</h2>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Clock className="w-6 h-6" />
              <p className="text-lg">{time.toLocaleTimeString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Weather */}
        <Card className="shadow-xl rounded-2xl p-4">
          <CardContent>
            <h2 className="text-xl font-bold mb-2">Weather</h2>
            {weather ? (
              <>
                <p className="text-lg">🌡️ {weather.current_weather.temperature}°C</p>
                <p className="flex items-center gap-2 mt-1">
                  {nextRain ? (
                    <>
                      <CloudRain className="w-5 h-5" />
                      Next rain at {new Date(nextRain).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </>
                  ) : (
                    <>
                      <Sun className="w-5 h-5" /> No rain expected today
                    </>
                  )}
                </p>
              </>
            ) : (
              <p>Loading weather...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Task Section styled like a calendar view */}
      <Card className="shadow-xl rounded-2xl p-4 w-full">
        <CardContent>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
            <ListTodo className="w-5 h-5" /> Task Planner
          </h2>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1 border rounded-xl px-3 py-2"
              placeholder="Add a new task"
            />
            <Button onClick={addTask}>Add</Button>
          </div>

          {/* Landscape style grid like Teams calendar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task, i) => (
              <div
                key={i}
                onClick={() => toggleTask(i)}
                className={`p-4 rounded-xl cursor-pointer border h-28 flex flex-col justify-between ${
                  task.done ? "line-through bg-gray-100" : "bg-white"
                }`}
              >
                <span className="font-medium">{task.text}</span>
                <div className="text-xs text-gray-500">
                  <div>Added: {formatDate(task.createdAt)} {new Date(task.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                  {task.done && task.completedAt && (
                    <div className="text-green-600">
                      Completed: {formatDate(task.completedAt)} {new Date(task.completedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Timeline view for tasks */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Timeline View</h3>
            <div className="space-y-4 border-l-2 border-gray-300 pl-4">
              {tasks
                .slice()
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((task, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-2 top-2 w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div
                      onClick={() => toggleTask(i)}
                      className={`p-3 rounded-xl cursor-pointer border ml-4 ${
                        task.done ? "line-through bg-gray-100" : "bg-white"
                      }`}
                    >
                      <span className="font-medium">{task.text}</span>
                      <div className="text-xs text-gray-500">
                        Added: {formatDate(task.createdAt)} {new Date(task.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        {task.done && task.completedAt && (
                          <div className="text-green-600">
                            Completed: {formatDate(task.completedAt)} {new Date(task.completedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
