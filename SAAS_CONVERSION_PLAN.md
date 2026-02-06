# 🚀 SaaS Conversion Plan: JanUmang

Transforming the current single-tenant administrative system into a scalable Multi-tenant SaaS (Software as a Service) application.

---

## 🏗️ Architectural Strategy: **Shared Database, Isolated Schema**

We will use a **Multi-tenancy with Discriminator** approach. Every data point in the database will be tagged with a `tenantId`. This is the most cost-effective and scalable approach for MongoDB.

### 1. Database Model Changes

#### A. New `Tenant` Model

Create a `tenantModel.js` to manage different organizations.
| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Organization name |
| `slug` | String | Unique identifier for URL (e.g., "delhi-assembly") |
| `plan` | String | (Basic, Pro, Enterprise) |
| `maxUsers` | Number | Limit on user accounts (e.g., 5, 50, -1 for unlimited) |
| `status` | String | active, suspended, trialing |

#### B. Update Existing Models

All data models (Voters, Issues, Users, etc.) must include a `tenantId`.

```javascript
// Example modification for all schemas
tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true // Crucial for performance
}
```

---

## 🔑 SaaS RBAC (Role-Based Access Control)

We will evolve your current RBAC into a three-tier system:

### 1. **System Super Admin (Global)**

- **Role**: `system_admin`
- **Scope**: Can see ALL data across ALL tenants.
- **Permissions**:
  - `manage_tenants`: Rename, delete, or suspend any client.
  - `manage_plans`: Change user limits or features for a tenant.
  - `global_reports`: View stats across the entire platform.

### 2. **Tenant Admin (Client Owner)**

- **Role**: `tenant_admin`
- **Scope**: Can only see data where `tenantId == current_tenant`.
- **Permissions**:
  - `manage_users`: Create/edit staff (limited by plan).
  - `manage_settings`: Update their own logo, address, etc.
  - `view_analytics`: Reports for their own organization.

### 3. **Standard User (Staff)**

- **Role**: `staff`, `viewer`, etc.
- **Scope**: Isolated to their `tenantId`.
- **Permissions**: Standard tasks like `create_voter`, `edit_issue`, etc.

---

## ⚖️ Usage Limiting (User Creation Cap)

To prevent a client from creating more users than they paid for, we will implement a **Usage Guard Service**.

### How it works:

1. **Request**: Admin tries to `POST /api/users`.
2. **Check**: Backend finds the `Tenant` record using `req.user.tenantId`.
3. **Logic**:

   ```javascript
   const currentUserCount = await User.countDocuments({
     tenantId: req.user.tenantId,
   });
   const tenantPlan = await Tenant.findById(req.user.tenantId);

   if (currentUserCount >= tenantPlan.maxUsers) {
     return next(
       new AppError("User limit reached for your plan. Upgrade now!", 403),
     );
   }
   ```

4. **Result**: Block creation if limit is reached.

---

## 🔒 Security & Isolation

### 1. Tenant Middleware (Backend)

Implement a middleware that identifies the tenant from the request.

- **Source**: `x-tenant-id` header, Subdomain (`tenant.app.com`), or JWT payload.
- **Action**: Attaches `req.tenantId` to every request.

### 2. Global Mongoose Plugin

To prevent developer error (forgetting to filter by tenant), we will implement a global Mongoose plugin that automatically:

- Appends `tenantId` to all `find`, `findOne`, `update`, and `delete` queries.
- Injects `tenantId` into all new documents during `save`.

---

## 🔑 Authentication & Authorization

### 1. Login Flow

- **Option A (Subdomain)**: User goes to `myorg.janumang.com/login`. Identifying the tenant is easy.
- **Option B (Universal)**: User goes to `janumang.com/login`. We identify their tenant after email entry or via their primary account.

### 2. Multi-Organization Support (Optional)

Allow a single User email to belong to multiple Tenants, with a "Switch Organization" feature.

---

## 💳 Billing & Subscription

### 1. Plan-Based Permissions

- **Free**: Max 500 Voters, 2 Admin users.
- **Pro**: Unlimited Voters, Activity Logs, Custom Reports.
- **Enterprise**: Custom Domain, White-labeling.

### 2. Stripe/Razorpay Integration

- Webhooks to handle subscription renewals and cancellations.
- Auto-suspend `Tenant` if payment fails.

---

## 🎨 Frontend (Next.js) Adjustments

1. **Dynamic Branding**: The app should fetch logo and primary colors from the `Tenant` settings on app load.
2. **Context Provider**: A `TenantContext` to keep track of current organization details.
3. **Tenant Switcher**: A dropdown in the profile menu for multi-org users.

---

## 🗺️ Roadmap & Milestones

### 📍 Phase 1: Foundation (The "Client" Layer)

- [x] **Create `Tenant` Model**: Define plans and user limits.
- [x] **Global Admin Role**: Create a `system_admin` role that has access to a new `Admin/Tenants` menu. (Backend implemented)
- [x] **Tenant Middleware**: Extract `tenantId` from JWT/Header to isolate requests.

### 📍 Phase 2: User Limiting & Onboarding

- [ ] **Plan Enforcement**: Implement the `Usage Guard` for the User Creation endpoint.
- [ ] **Tenant Dashboard**: A UI for the Global Admin to create new Clients/Tenants.
- [ ] **Signup Flow**: Allow new clients to register and automatically create their `Tenant` and first `Admin` account.

### 📍 Phase 3: Data Migration

- [ ] **Refactor Models**: Add `tenantId` to all 30+ models.
- [/] **The "Tenant Filter"**: Implement a global Mongoose plugin to automatically apply `{ tenantId: req.tenantId }` to every query. (Migration script created)
- [ ] **Frontend Update**: Add a "Company Settings" page for Tenant Admins.

---

## ❓ Next Steps for You

1. **Confirm Strategy**: Does this three-tier RBAC and the Usage Guard logic sound correct for your vision?
2. **Phase 1 Execution**: Should I start by creating the `Tenant` model and setting up the Multi-tenant folder structure?
