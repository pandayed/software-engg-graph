# Software Engineering Graph

An interactive graph visualization for software engineering concepts.

## Contributing: Adding New Nodes

Each node in the graph is a folder inside the `content/` directory containing two files:

### 1. Create a new folder

Create a folder with your node's ID as the name (use kebab-case):

```
content/your-node-id/
```

### 2. Create `meta.yaml`

This file defines the node metadata and its connections:

```yaml
id: your-node-id
title: Your Node Title
prerequisites:
  - parent-node-id
next:
  - child-node-id-1
  - child-node-id-2
```

| Field | Description |
|-------|-------------|
| `id` | Unique identifier in kebab-case (must match folder name) |
| `title` | Display title for the node |
| `prerequisites` | Array of node IDs that should be learned before this node (incoming edges) |
| `next` | Array of node IDs that follow this node (outgoing edges) |

### 3. Create `content.md`

This file contains the node's content in Markdown format:

```markdown
Brief description of the concept.

## Section Heading

Details about this section.

## Another Section

More content here.
```

### Example

For a node about "Load Balancers":

**Folder:** `content/load-balancer/`

**meta.yaml:**
```yaml
id: load-balancer
title: Load Balancer
prerequisites:
  - servers
next:
  - load-balancer-algorithms
  - load-balancer-types
```

**content.md:**
```markdown
A load balancer distributes incoming network traffic across multiple servers.

## Purpose

- Prevents server overload
- Improves availability
- Enables horizontal scaling
```

### ID Naming Conventions

- Use kebab-case: lowercase letters, numbers, and hyphens only
- IDs must be unique across the entire graph
- Use descriptive names that clearly identify the concept

**Language/Technology Prefixes:**

When a concept exists in multiple languages or technologies, prefix the ID with the language/technology name:

| Concept | Python ID | C++ ID | JavaScript ID |
|---------|-----------|--------|---------------|
| Loops | `python-loops` | `cpp-loops` | `js-loops` |
| Classes | `python-classes` | `cpp-classes` | `js-classes` |
| Functions | `python-functions` | `cpp-functions` | `js-functions` |

Common prefixes:
- `python-` for Python
- `cpp-` for C++
- `js-` for JavaScript
- `java-` for Java
- `go-` for Go
- `rust-` for Rust

**Generic Concepts:**

For language-agnostic concepts, use the concept name directly without a prefix:

- `loops` (general concept of loops)
- `recursion` (general recursion theory)
- `data-structures` (overview of data structures)

### Validation Rules

- `id` must be unique and in kebab-case (lowercase letters, numbers, hyphens)
- `prerequisites` must reference existing node IDs
- `content.md` cannot be empty
