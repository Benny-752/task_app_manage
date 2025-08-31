import { useState, useEffect } from "react";

export default function Home() {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=12.97&longitude=77.59&hourly=precipitation&current_weather=true`
        );
        const data = await res.json();
        setWeather(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchWeather();
  }, []);

  const addTask = () => {
    if (!newTask) return;
    const task = {
      text: newTask,
      created: new Date(),
      done: false,
      completedAt: null,
    };
    setTasks([...tasks, task]);
    setNewTask("");
  };

  const toggleTask = (index) => {
    const updated = [...tasks];
    updated[index].done = !updated[index].done;
    updated[index].completedAt = updated[index].done ? new Date() : null;
    setTasks(updated);
  };

  const formatDate = (date) => {
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getFullYear()).slice(2)}`;
  };

  const formatTime = (date) => {
    return `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white shadow p-4 rounded-xl">
        <div>
          <h1 className="text-xl font-bold">Daily Tracker</h1>
          <p>{formatDate(time)} {formatTime(time)}</p>
        </div>
        <div>
          {weather ? (
            <>
              <p>
                🌡️ {weather.current_weather.temperature}°C |{" "}
                {weather.current_weather.weathercode}
              </p>
              <p>
                {weather.hourly.precipitation.some((p) => p > 0)
                  ? "🌧️ Rain expected today"
                  : "☀️ No rain today"}
              </p>
            </>
          ) : (
            <p>Loading weather...</p>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="font-semibold mb-2">Task Planner</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter new task"
            className="flex-1 border rounded p-2"
          />
          <button
            onClick={addTask}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>

        <ul className="space-y-2">
          {tasks.map((task, i) => (
            <li
              key={i}
              className="flex justify-between items-center p-2 border rounded"
            >
              <div>
                <span
                  className={
                    task.done ? "line-through text-gray-500" : "text-black"
                  }
                >
                  {task.text}
                </span>
                <div className="text-xs text-gray-500">
                  Added: {formatDate(task.created)} {formatTime(task.created)}
                  {task.completedAt && (
                    <>
                      {" "}| Completed: {formatDate(task.completedAt)}{" "}
                      {formatTime(task.completedAt)}
                    </>
                  )}
                </div>
              </div>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(i)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
