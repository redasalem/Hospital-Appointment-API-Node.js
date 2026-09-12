# 👨‍⚕️ Doctor Management (`HAA-4`) Implementation Plan

A comprehensive, step-by-step engineering roadmap and task checklist for developing the **Doctor Management** module in the **Hospital Appointment API** (`Team 5`).

---

## 📌 Feature Overview & Scope

- **Jira Task:** `HAA-4`
- **Assignee:** Reda Salem
- **Module:** Doctor Profile Management (CRUD)
- **Target Endpoints:**
  1. `POST   /api/doctors` — Create a doctor profile *(Authorized: Admin)*
  2. `GET    /api/doctors` — List all doctors with filtering, search & pagination *(Public / All)*
  3. `GET    /api/doctors/:id` — Retrieve a single doctor by ID *(Public / All)*
  4. `PATCH  /api/doctors/:id` — Update doctor profile *(Authorized: Admin)*
  5. `DELETE /api/doctors/:id` — Delete doctor profile with appointment-check safety *(Authorized: Admin)*

---

## 🗺️ Step-by-Step Checklist Roadmap

### Phase 1: Data Modeling & Schema Design
> **Goal:** Design a robust, scalable Mongoose schema for doctor records that seamlessly integrates with appointment scheduling.

- [x] **1.1 Create Model File:** `src/models/doctor.model.js`
- [x] **1.2 Define Schema Attributes:**
  - `name` *(String, required, trimmed, min: 2, max: 100)*
  - `specialization` *(String, required, trimmed, indexed)*
  - `description` *(String, trimmed, optional)*
  - `phone` *(String, required, trimmed)*
  - `workingHours` *(Array of sub-documents defining working schedule)*:
    - `day` *(String, enum: Monday-Sunday, required)*
    - `startTime` *(String, format: "HH:mm", required, e.g. "09:00")*
    - `endTime` *(String, format: "HH:mm", required, e.g. "17:00")*
  - `isActive` *(Boolean, default: true)* — enables soft-deactivation if needed
- [x] **1.3 Add Performance Indexes & Timestamps:**
  - Compound / single indexes on `specialization` and `name` for high-performance search queries.
  - Enable `{ timestamps: true }` (`createdAt`, `updatedAt`).

---

### Phase 2: Input Validation Layer (Joi)
> **Goal:** Guard the application boundary by validating and sanitizing incoming payloads before hitting controllers or database logic.

- [x] **2.1 Create Validation File:** `src/validators/doctor.validator.js`
- [x] **2.2 Create Doctor Schema (`createDoctorSchema`):**
  - Validate required fields (`name`, `specialization`, `phone`, `workingHours`).
  - Validate `workingHours` items: day names and `HH:mm` format regex.
  - Ensure `startTime < endTime`.
- [x] **2.3 Update Doctor Schema (`updateDoctorSchema`):**
  - Allow partial updates while preventing empty body payloads (`.min(1)`).
- [x] **2.4 Parameter ID Validation (`mongoIdSchema`):**
  - Verify that `:id` parameter conforms to a valid 24-character hexadecimal MongoDB ObjectId.
- [x] **2.5 Query Parameters Schema (`doctorQuerySchema`):**
  - Validate query filters: `specialization`, `search`, `page`, and `limit`.
- [x] **2.6 Reusable Validation Middleware:**
  - Ensure a generic validator middleware (`src/middlewares/validate.middleware.js`) handles `body`, `params`, and `query` validation cleanly.

---

### Phase 3: Business Logic & Service Layer
> **Goal:** Encapsulate database operations and business rules in a decoupled service layer.

- [x] **3.1 Create Service File:** `src/services/doctor.service.js`
- [x] **3.2 `createDoctor(data)`:**
  - Persist new doctor profile in MongoDB and return the created record.
- [x] **3.3 `getAllDoctors(filterOptions, paginationOptions)`:**
  - Case-insensitive text search on `name`.
  - Exact or partial match on `specialization`.
  - Pagination calculations: `page`, `limit`, `skip`, `totalPages`, and `totalCount`.
- [x] **3.4 `getDoctorById(id)`:**
  - Find doctor by ID; throw custom `404 Not Found` error if non-existent.
- [x] **3.5 `updateDoctor(id, updateData)`:**
  - Update doctor with `{ new: true, runValidators: true }`; throw `404` if not found.
- [x] **3.6 `deleteDoctor(id)`:**
  - **Critical Business Rule:** Check for any upcoming or active appointments (`pending`, `confirmed`) linked to this doctor.
  - Reject deletion with `409 Conflict` (or `400 Bad Request`) if active appointments exist.
  - Remove doctor document if no active appointments are pending.

---

### Phase 4: Controller Layer (HTTP Transport)
> **Goal:** Handle incoming HTTP requests, delegate to services, and send consistent, standardized responses.

- [x] **4.1 Create Controller File:** `src/controllers/doctor.controller.js`
- [x] **4.2 Implement Route Handlers:**
  - `createDoctorHandler` -> HTTP `201 Created`
  - `getAllDoctorsHandler` -> HTTP `200 OK` (includes data + pagination metadata)
  - `getDoctorByIdHandler` -> HTTP `200 OK`
  - `updateDoctorHandler` -> HTTP `200 OK`
  - `deleteDoctorHandler` -> HTTP `200 OK` (confirmation message)
- [x] **4.3 Standardize Response Envelope:**
  ```json
  {
    "success": true,
    "message": "Doctor retrieved successfully",
    "data": { ... }
  }
  ```
- [x] **4.4 Async Error Propagation:**
  - Utilize Express 5 native async error forwarding to central error middleware.

---

### Phase 5: Routing & RBAC Integration
> **Goal:** Expose RESTful endpoints, link validation middleware, and prepare authentication/role guards.

- [x] **5.1 Create Route File:** `src/routes/doctor.routes.js`
- [x] **5.2 Wire Endpoints with Middleware:**
  - `POST   /` -> `[protect, restrictTo('Admin'), validate(createDoctorSchema), createDoctorHandler]`
  - `GET    /` -> `[validate(doctorQuerySchema), getAllDoctorsHandler]`
  - `GET    /:id` -> `[validate(mongoIdSchema), getDoctorByIdHandler]`
  - `PATCH  /:id` -> `[protect, restrictTo('Admin'), validate(mongoIdSchema), validate(updateDoctorSchema), updateDoctorHandler]`
  - `DELETE /:id` -> `[protect, restrictTo('Admin'), validate(mongoIdSchema), deleteDoctorHandler]`
- [x] **5.3 Auth Middleware Stubs:**
  - Provide fallback/placeholder middleware for `protect` and `restrictTo('Admin')` so the module functions immediately and plugs into Karim's Auth module seamlessly.
- [x] **5.4 Register Routes in Application:**
  - Mount `/api/doctors` in `src/app.js`.

---

### Phase 6: Documentation & Verification
> **Goal:** Deliver clear OpenAPI/Swagger documentation and a fully tested Postman collection.

- [ ] **6.1 Swagger / OpenAPI Documentation:**
  - Document all 5 doctor endpoints, parameters, request bodies, and responses in `docs/swagger.yaml` or Swagger JSDoc annotations.
- [ ] **6.2 Postman Collection:**
  - Update `postman/HospitalAppointmentAPI.postman_collection.json` with a dedicated `Doctors` folder covering:
    - Successful doctor creation (`POST 201`).
    - Validation error when missing required fields (`POST 400`).
    - Filter doctors by specialization and pagination (`GET 200`).
    - Fetch doctor with valid ID (`GET 200`).
    - Fetch doctor with non-existent ID (`GET 404`).
    - Fetch doctor with malformed ID (`GET 400`).
    - Partial profile update (`PATCH 200`).
    - Safe doctor deletion (`DELETE 200`).
    - Blocked deletion due to existing appointments (`DELETE 409`).

---

## 🤝 Team Integration Points

| Team Member | Module | Integration Point with Doctor Management |
| :--- | :--- | :--- |
| **Karim Khaled Ismail** | Auth & RBAC (`HAA-3`) | Routes hook into `authenticate` and `authorize('Admin')` middleware. |
| **Mousa Ahmed** | Appointments (`HAA-5`) | `workingHours` schema format allows appointment logic to validate doctor availability slots and prevent double-booking. |

---

## ⚡ Edge Cases Handled

1. **Invalid ID Format:** Rejects invalid MongoDB ObjectIDs at the validation layer with `400 Bad Request`.
2. **Resource Not Found:** Returns standard `404 Not Found` when a doctor does not exist.
3. **Invalid Working Hours:** Rejects time slots where `startTime >= endTime` or invalid time formats.
4. **Active Appointments on Delete:** Enforces business integrity rule preventing deletion of doctors with scheduled appointments.
5. **Empty Update Body:** Rejects `PATCH` requests containing empty JSON payloads.
