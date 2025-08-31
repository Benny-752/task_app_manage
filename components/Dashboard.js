import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudRain, Sun, Clock, Calendar, ListTodo } from "lucide-react";

export default function Dashboard() {
  const [time, setTime] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        const city = process.env.NEXT_PUBLIC_CITY || 'Bengaluru';
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
        const data = await res.json();
        setWeather(data);
      } catch (err) { console.error(err); }
    };
    fetchWeather();
  }, []);

  const addTask = () => {
    if (newTask.trim() !== "") {
      setTasks([...tasks, { text: newTask, done: false, createdAt: new Date() }]);
      setNewTask("");
    }
  };

  const toggleTask = (index) => {
    const updated = [...tasks];
    updated[index].done = !updated[index].done;
    updated[index].completedAt = updated[index].done ? new Date() : null;
    setTasks(updated);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2,"0");
    const month = String(d.getMonth()+1).padStart(2,"0");
    const year = String(d.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  const nextRain = weather?.weather?.some(w => w.main.toLowerCase().includes('rain'));

  return (
    <div className="p-6 grid gap-6">
      <div className="grid md:grid-cols-2 gap-6">
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

        <Card className="shadow-xl rounded-2xl p-4">
          <CardContent>
            <h2 className="text-xl font-bold mb-2">Weather</h2>
            {weather ? (
              <>
                <p className="text-lg">🌡️ {weather.main.temp}°C</p>
                <p className="flex items-center gap-2 mt-1">
                  {nextRain ? (<><CloudRain className="w-5 h-5" /> Rain expected today</>) :
                  (<><Sun className="w-5 h-5" /> No rain expected today</>)}
                </p>
              </>
            ) : (<p>Loading weather...</p>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}