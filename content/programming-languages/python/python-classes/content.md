Classes are blueprints for creating objects with attributes and methods.

## Basic Class

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def greet(self):
        return f"Hello, I'm {self.name}"

person = Person("Alice", 30)
print(person.greet())
```

## Inheritance

```python
class Employee(Person):
    def __init__(self, name, age, role):
        super().__init__(name, age)
        self.role = role
```

## Class vs Instance Attributes

```python
class Dog:
    species = "Canis familiaris"  # Class attribute

    def __init__(self, name):
        self.name = name  # Instance attribute
```

## Special Methods

- `__init__`: Constructor.
- `__str__`: String representation.
- `__repr__`: Developer representation.
- `__eq__`: Equality comparison.
- `__len__`: Length.
- `__getitem__`: Indexing.

## Properties

```python
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = value
```

