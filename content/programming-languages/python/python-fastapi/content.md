FastAPI is a modern, high-performance web framework for building APIs with Python.

## Basic Application

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}
```

## Request Body with Pydantic

```python
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    price: float
    is_offer: bool = False

@app.post("/items/")
def create_item(item: Item):
    return item
```

## Path and Query Parameters

```python
@app.get("/users/{user_id}/items/{item_id}")
def get_user_item(
    user_id: int,
    item_id: int,
    q: str = None,
    skip: int = 0,
    limit: int = 10
):
    return {"user_id": user_id, "item_id": item_id}
```

## Dependency Injection

```python
from fastapi import Depends

def get_db():
    db = Database()
    try:
        yield db
    finally:
        db.close()

@app.get("/users/")
def get_users(db: Database = Depends(get_db)):
    return db.get_users()
```

## Response Models

```python
class UserResponse(BaseModel):
    id: int
    name: str

@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int):
    return get_user_from_db(user_id)
```

## Exception Handling

```python
from fastapi import HTTPException

@app.get("/items/{item_id}")
def read_item(item_id: int):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    return items[item_id]
```

## Middleware

```python
@app.middleware("http")
async def add_process_time_header(request, call_next):
    import time
    start = time.time()
    response = await call_next(request)
    response.headers["X-Process-Time"] = str(time.time() - start)
    return response
```

