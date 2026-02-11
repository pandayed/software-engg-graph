Functions are reusable blocks of code that perform specific tasks.

## Basic Function

```python
def greet(name):
    return f"Hello, {name}!"

print(greet("Alice"))
```

## Default Arguments

```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"
```

## Keyword Arguments

```python
def create_user(name, age, role="user"):
    return {"name": name, "age": age, "role": role}

user = create_user(name="Alice", age=30, role="admin")
```

## *args and **kwargs

```python
def sum_all(*args):
    return sum(args)

def print_info(**kwargs):
    for key, value in kwargs.items():
        print(f"{key}: {value}")
```

## Lambda Functions

Anonymous functions for simple operations.

```python
square = lambda x: x ** 2
add = lambda a, b: a + b
```

## First-Class Functions

Functions can be passed as arguments and returned from other functions.

```python
def apply(func, value):
    return func(value)

result = apply(lambda x: x * 2, 5)
```

