from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, EmailStr
import mysql.connector, jwt, datetime, bcrypt

app = FastAPI()

def get_db():
    return mysql.connector.connect(host="mysql", user="root", password="password", database="student_db")
SECRET = "your_jwt_secret"

class User(BaseModel):
    email: EmailStr
    password: str

class Student(BaseModel):
    name: str; age: int; department: str

@app.post("/signup")
def signup(u: User):
    db = get_db(); c = db.cursor()
    c.execute("INSERT INTO users (email,password) VALUES (%s,%s)", (u.email, bcrypt.hashpw(u.password.encode(), bcrypt.gensalt())))
    db.commit(); return {"message": "Signed up"}

@app.post("/login")
def login(u: User):
    db = get_db(); c = db.cursor(dictionary=True)
    c.execute("SELECT * FROM users WHERE email=%s", (u.email,))
    usr = c.fetchone()
    if not usr or not bcrypt.checkpw(u.password.encode(), usr["password"].encode()): raise HTTPException(401,"Invalid")
    token = jwt.encode({"user":usr["email"], "exp": datetime.datetime.utcnow()+datetime.timedelta(hours=2)}, SECRET)
    return {"email": usr["email"], "token": token}

def verify(token: str = Depends(lambda token="": token)):
    try:
        return jwt.decode(token, SECRET, algorithms=["HS256"])["user"]
    except:
        raise HTTPException(403, "Invalid token")

@app.post("/students")
def add_student(s: Student, user=Depends(verify)):
    db = get_db(); c = db.cursor()
    c.execute("INSERT INTO students (name, age, department) VALUES (%s,%s,%s)", (s.name,s.age,s.department))
    db.commit(); return {"message": "Added"}

@app.get("/view")
def view_students(user=Depends(verify)):
    db = get_db(); c = db.cursor(dictionary=True)
    c.execute("SELECT * FROM students"); return c.fetchall()
