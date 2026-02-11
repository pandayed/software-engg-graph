Lightweight, isolated environments sharing the host OS kernel but running separate applications with their own dependencies.

## Characteristics

- Usually run on top of virtual or physical servers.
- Managed with tools like Docker and Kubernetes.
- Applications start and stop quickly.

## Advantages

- Minimal resource overhead (no duplicate OS).
- Fast scaling and deployment.
- Easy to run many isolated services on one machine.

## Limitations

- Shares the same OS kernel — not suitable for apps requiring different OS types.
- Requires container orchestration for large deployments.

