Python provides two main loop constructs for iteration.

## For Loop

Iterates over a sequence (list, tuple, string, range, etc.).

```python
for item in [1, 2, 3]:
    print(item)

for i in range(5):
    print(i)
```

## While Loop

Repeats while a condition is true.

```python
count = 0
while count < 5:
    print(count)
    count += 1
```

## Loop Control

- **break**: Exit the loop immediately.
- **continue**: Skip to the next iteration.
- **else**: Executes when loop completes without break.

```python
for i in range(10):
    if i == 5:
        break
    if i % 2 == 0:
        continue
    print(i)
else:
    print("Loop completed")
```

## Comprehensions

Concise way to create sequences.

```python
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
```

