CDN = Content Delivery Network = **Distributed system of servers** deployed across multiple geographical locations.

Primary purpose: **Deliver digital content with high availability, performance, and scalability**.

## How CDN Works

1. User requests content (e.g., website).
2. Request is routed to most optimal edge server (based on routing strategy).
3. If cached copy available → served immediately.
4. If not cached → edge server fetches from origin → serves to client → caches it for future.

## Benefits

- **Reduced latency**: Content delivered from nearest location.
- **Lower bandwidth consumption**: Cached assets reduce repeated origin fetches.
- **High availability**: Load distributed across multiple servers.
- **Scalability**: Handles traffic spikes.
- **Security**: All user requests first hit the **CDN edge servers**, not your main server, so lots of filtering can be done here (TLS, DDoS, Bot Mitigation, WAF, Rate Limiting etc).

## Types of Content Served

- **Static content**: Images, scripts, stylesheets.
- **Dynamic content**: Personalized or user-specific data (can be optimized with edge computation).
- **Streaming content**: Video-on-demand (VoD), live streaming with chunked delivery.
- **APIs**: REST, GraphQL served via CDN with caching or edge logic.

## Beyond Content Delivery

- **Edge computing**: Running logic/functions at edge.
- **Serverless at edge**: Executing lightweight scripts near users.
- **Analytics**: Collecting metrics on traffic, cache hit ratio, latency, errors.

## Popular CDN Providers

- Akamai
- Cloudflare
- Amazon CloudFront
- Google Cloud CDN
- Microsoft Azure CDN
- Fastly
- StackPath
- Imperva (formerly Incapsula)
- CDN77
- KeyCDN

