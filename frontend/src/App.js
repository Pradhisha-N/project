import React, { useState, useEffect } from "react";
import API from "./api";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({name:"",age:"",department:"",email:"",password:""});
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (user) loadStudents();
  }, [user]);

  const handleLoginSignup = async (e, route) => {
    e.preventDefault();
    const res = await API.post(`/${route}`, form);
    if (route === "signup") alert(res.data.message || "Signed up");
    else setUser(res.data);
    setForm({ ...form, password:"" });
  };

  const handleAdd = async e => {
    e.preventDefault();
    await API.post("/students", form);
    loadStudents();
    setForm({name:"",age:"",department:""});
  };

  const loadStudents = async () => {
    const res = await API.get("/view");
    setStudents(res.data);
  };

  if (!user) return (
    <div className="container">
      <h2>Signup / Login</h2>
      <form onSubmit={e=>handleLoginSignup(e,"signup")}>
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
        <button type="submit">Signup</button>
      </form>
      <form onSubmit={e=>handleLoginSignup(e,"login")}>
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
        <button type="submit">Login</button>
      </form>
    </div>
  );

  return (
    <div className="container">
      <h2>Welcome, {user.email}</h2>
      <form onSubmit={handleAdd}>
        <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input placeholder="Age" value={form.age} onChange={e=>setForm({...form,age:e.target.value})}/>
        <input placeholder="Department" value={form.department} onChange={e=>setForm({...form,department:e.target.value})}/>
        <button type="submit">Add Student</button>
      </form>
      <div className="students-list">
        <h2>Students List</h2>
        <ul>{students.map(s=><li key={s.id}>{s.name} — {s.age} — {s.department}</li>)}</ul>
      </div>
    </div>
  );
}

export default App;
