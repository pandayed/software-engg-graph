Pydantic is a data validation library using Python type hints.

## Basic Model

```python
from pydantic import BaseModel

class User(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool = True

user = User(id=1, name="Alice", email="alice@example.com")
```

## Validation

```python
from pydantic import BaseModel, Field, field_validator

class Product(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    price: float = Field(gt=0)
    quantity: int = Field(ge=0)

    @field_validator("name")
    @classmethod
    def name_must_be_capitalized(cls, v):
        return v.title()
```

## Nested Models

```python
class Address(BaseModel):
    street: str
    city: str

class Company(BaseModel):
    name: str
    address: Address
```

## Serialization

```python
user_dict = user.model_dump()
user_json = user.model_dump_json()

user = User.model_validate({"id": 1, "name": "Alice", "email": "a@b.com"})
user = User.model_validate_json('{"id": 1, "name": "Alice", "email": "a@b.com"}')
```

## Settings Management

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    api_key: str
    debug: bool = False

    class Config:
        env_file = ".env"
```

## Custom Types

```python
from pydantic import BaseModel
from typing import Annotated
from pydantic.functional_validators import AfterValidator

def validate_positive(v: int) -> int:
    if v <= 0:
        raise ValueError("must be positive")
    return v

PositiveInt = Annotated[int, AfterValidator(validate_positive)]
```

