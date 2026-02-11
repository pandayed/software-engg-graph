SQLAlchemy is a SQL toolkit and Object-Relational Mapping (ORM) library for Python.

## Engine and Connection

```python
from sqlalchemy import create_engine

engine = create_engine("postgresql://user:pass@localhost/db")
```

## Declarative Models (ORM)

```python
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, ForeignKey

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True)
```

## Relationships

```python
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    posts: Mapped[list["Post"]] = relationship(back_populates="author")

class Post(Base):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    author: Mapped["User"] = relationship(back_populates="posts")
```

## Session and CRUD

```python
from sqlalchemy.orm import Session

with Session(engine) as session:
    user = User(name="Alice", email="alice@example.com")
    session.add(user)
    session.commit()

    users = session.query(User).filter(User.name == "Alice").all()

    user.name = "Alice Smith"
    session.commit()

    session.delete(user)
    session.commit()
```

## Query with Select (2.0 Style)

```python
from sqlalchemy import select

stmt = select(User).where(User.name == "Alice")
result = session.execute(stmt)
users = result.scalars().all()
```

## Async Support

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

engine = create_async_engine("postgresql+asyncpg://user:pass@localhost/db")

async with AsyncSession(engine) as session:
    result = await session.execute(select(User))
    users = result.scalars().all()
```

