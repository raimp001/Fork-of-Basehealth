# Healthcare Platform API Documentation

## Overview

This API provides access to the Healthcare Platform's core functionality, allowing third-party applications to integrate with our services. The API follows RESTful principles and uses JSON for data exchange.

## Base URL

\`\`\`
https://your-healthcare-domain.com/api/v1
\`\`\`

## Authentication

All API requests require authentication using a Bearer token in the Authorization header:

\`\`\`
Authorization: Bearer YOUR_API_TOKEN
\`\`\`

To obtain an API token, please contact our support team.

## Rate Limiting

API requests are limited to 100 requests per minute per API token.

## Endpoints

### Patients

#### Get All Patients

\`\`\`
GET /patients
\`\`\`

Query Parameters:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of results per page (default: 20)
- `search` (optional): Search term for patient name or email

Response:
\`\`\`json
{
  "patients": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "dateOfBirth": "string",
      "medicalHistory": ["string"],
      "allergies": ["string"],
      "medications": ["string"]
    }
  ],
  "pagination": {
    "total": "number",
    "pages": "number",
    "currentPage": "number",
    "limit": "number"
  }
}
\`\`\`

#### Get Patient by ID

\`\`\`
GET /patients/{id}
\`\`\`

Response:
\`\`\`json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "dateOfBirth": "string",
  "medicalHistory": ["string"],
  "allergies": ["string"],
  "medications": ["string"],
  "insuranceInfo": {
    "provider": "string",
    "policyNumber": "string"
  },
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string"
  },
  "preferredPharmacy": {
    "name": "string",
    "address": "string",
    "phone": "string"
  }
}
\`\`\`

#### Create Patient

\`\`\`
POST /patients
\`\`\`

Request Body:
\`\`\`json
{
  "name": "string",
  "email": "string",
  "dateOfBirth": "string",
  "medicalHistory": ["string"],
  "allergies": ["string"],
  "medications": ["string"],
  "insuranceInfo": {
    "provider": "string",
    "policyNumber": "string"
  },
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string"
  },
  "preferredPharmacy": {
    "name": "string",
    "address": "string",
    "phone": "string"
  }
}
\`\`\`

Response:
\`\`\`json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "dateOfBirth": "string",
  "createdAt": "string"
}
\`\`\`

#### Update Patient

\`\`\`
PUT /patients/{id}
\`\`\`

Request Body: Same as Create Patient

Response: Same as Get Patient by ID

#### Delete Patient

\`\`\`
DELETE /patients/{id}
\`\`\`

Response:
\`\`\`json
{
  "success": true,
  "message": "Patient deleted successfully"
}
\`\`\`

### Providers

#### Get All Providers

\`\`\`
GET /providers
\`\`\`

Query Parameters:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of results per page (default: 20)
- `specialty` (optional): Filter by specialty
- `zipCode` (optional): Filter by zip code
- `verificationStatus` (optional): Filter by verification status

Response:
\`\`\`json
{
  "providers": [
    {
      "id": "string",
      "name": "string",
      "specialty": "string",
      "rating": "number",
      "reviewCount": "number",
      "isVerified": "boolean"
    }
  ],
  "pagination": {
    "total": "number",
    "pages": "number",
    "currentPage": "number",
    "limit": "number"
  }
}
\`\`\`

#### Get Provider by ID

\`\`\`
GET /providers/{id}
\`\`\`

Response:
\`\`\`json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "specialty": "string",
  "credentials": ["string"],
  "licenseNumber": "string",
  "licenseState": "string",
  "licenseExpiration": "string",
  "education": ["string"],
  "yearsOfExperience": "number",
  "bio": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string"
  },
  "availability": {
    "days": ["string"],
    "hours": {
      "start": "string",
      "end": "string"
    }
  },
  "consultationFee": "number",
  "rating": "number",
  "reviewCount": "number",
  "isVerified": "boolean",
  "verificationStatus": "string",
  "acceptedInsurance": ["string"],
  "services": ["string"]
}
\`\`\`

#### Create Provider

\`\`\`
POST /providers
\`\`\`

Request Body: Provider details (similar to response format)

Response:
\`\`\`json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "specialty": "string",
  "verificationStatus": "pending",
  "createdAt": "string"
}
\`\`\`

#### Update Provider

\`\`\`
PUT /providers/{id}
\`\`\`

Request Body: Provider details to update

Response: Same as Get Provider by ID

#### Delete Provider

\`\`\`
DELETE /providers/{id}
\`\`\`

Response:
\`\`\`json
{
  "success": true,
  "message": "Provider deleted successfully"
}
\`\`\`

### Appointments

#### Get All Appointments

\`\`\`
GET /appointments
\`\`\`

Query Parameters:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of results per page (default: 20)
- `patientId` (optional): Filter by patient ID
- `providerId` (optional): Filter by provider ID
- `status` (optional): Filter by status
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

Response:
\`\`\`json
{
  "appointments": [
    {
      "id": "string",
      "patientId": "string",
      "patientName": "string",
      "providerId": "string",
      "providerName": "string",
      "date": "string",
      "startTime": "string",
      "endTime": "string",
      "status": "string",
      "type": "string"
    }
  ],
  "pagination": {
    "total": "number",
    "pages": "number",
    "currentPage": "number",
    "limit": "number"
  }
}
\`\`\`

#### Get Appointment by ID

\`\`\`
GET /appointments/{id}
\`\`\`

Response:
\`\`\`json
{
  "id": "string",
  "patientId": "string",
  "patientName": "string",
  "providerId": "string",
  "providerName": "string",
  "date": "string",
  "startTime": "string",
  "endTime": "string",
  "status": "string",
  "type": "string",
  "notes": "string",
  "symptoms": ["string"],
  "diagnosis": ["string"],
  "prescriptions": [
    {
      "id": "string",
      "medication": "string",
      "dosage": "string",
      "frequency": "string",
      "duration": "string"
    }
  ],
  "labOrders": [
    {
      "id": "string",
      "testName": "string",
      "testCode": "string",
      "status": "string"
    }
  ],
  "imagingOrders": [
    {
      "id": "string",
      "imagingType": "string",
      "bodyPart": "string",
      "status": "string"
    }
  ],
  "referrals": [
    {
      "id": "string",
      "referredToProviderId": "string",
      "referredToProviderName": "string",
      "reason": "string",
      "status": "string"
    }
  ],
  "followUpRequired": "boolean",
  "followUpDate": "string",
  "paymentStatus": "string",
  "paymentAmount": "number",
  "meetingLink": "string"
}
\`\`\`

#### Create Appointment

\`\`\`
POST /appointments
\`\`\`

Request Body:
\`\`\`json
{
  "patientId": "string",
  "providerId": "string",
  "date": "string",
  "startTime": "string",
  "endTime": "string",
  "type": "string",
  "symptoms": ["string"],
  "notes": "string"
}
\`\`\`

Response:
\`\`\`json
{
  "id": "string",
  "patientId": "string",
  "providerId": "string",
  "date": "string",
  "startTime": "string",
  "endTime": "string",
  "status": "scheduled",
  "type": "string",
  "meetingLink": "string"
}
\`\`\`

#### Update Appointment

\`\`\`
PUT /appointments/{id}
\`\`\`

Request Body: Appointment details to update

Response: Same as Get Appointment by ID

#### Cancel Appointment

\`\`\`
POST /appointments/{id}/cancel
\`\`\`

Response:
\`\`\`json
{
  "id": "string",
  "status": "cancelled",
  "message": "Appointment cancelled successfully"
}
\`\`\`

### Medical Records

#### Get Patient Medical Records

\`\`\`
GET /patients/{patientId}/medical-records
\`\`\`

Response:
\`\`\`json
{
  "prescriptions": [
    {
      "id": "string",
      "medication": "string",
      "dosage": "string",
      "frequency": "string",
      "duration": "string",
      "issuedDate": "string",
      "status": "string"
    }
  ],
  "labOrders": [
    {
      "id": "string",
      "testName": "string",
      "testCode": "string",
      "issuedDate": "string",
      "status": "string",
      "results": {
        "date": "string",
        "value": "string",
        "unit": "string",
        "referenceRange": "string",
        "interpretation": "string"
      }
    }
  ],
  "imagingOrders": [
    {
      "id": "string",
      "imagingType": "string",
      "bodyPart": "string",
      "issuedDate": "string",
      "status": "string",
      "results": {
        "date": "string",
        "findings": "string",
        "impression": "string"
      }
    }
  ],
  "referrals": [
    {
      "id": "string",
      "referringProviderId": "string",
      "referringProviderName": "string",
      "referredToProviderId": "string",
      "referredToProviderName": "string",
      "reason": "string",
      "status": "string",
      "createdAt": "string"
    }
  ]
}
\`\`\`

### Prescriptions

#### Create Prescription

\`\`\`
POST /prescriptions
\`\`\`

Request Body:
\`\`\`json
{
  "patientId": "string",
  "providerId": "string",
  "appointmentId": "string",
  "medication": "string",
  "dosage": "string",
  "frequency": "string",
  "duration": "string",
  "instructions": "string",
  "refillsAllowed": "number"
}
\`\`\`

Response:
\`\`\`json
{
  "id": "string",
  "patientId": "string",
  "providerId": "string",
  "medication": "string",
  "issuedDate": "string",
  "status": "active"
}
\`\`\`

### Lab Orders

#### Create Lab Order

\`\`\`
POST /lab-orders
\`\`\`

Request Body:
\`\`\`json
{
  "patientId": "string",
  "providerId": "string",
  "appointmentId": "string",
  "testName": "string",
  "testCode": "string",
  "instructions": "string"
}
\`\`\`

Response:
\`\`\`json
{
  "id": "string",
  "patientId": "string",
  "providerId": "string",
  "testName": "string",
  "issuedDate": "string",
  "status": "ordered"
}
\`\`\`

### Imaging Orders

#### Create Imaging Order

\`\`\`
POST /imaging-orders
\`\`\`

Request Body:
\`\`\`json
{
  "patientId": "string",
  "providerId": "string",
  "appointmentId": "string",
  "imagingType": "string",
  "bodyPart": "string",
  "instructions": "string"
}
\`\`\`

Response:
\`\`\`json
{
  "id": "string",
  "patientId": "string",
  "providerId": "string",
  "imagingType": "string",
  "bodyPart": "string",
  "issuedDate": "string",
  "status": "ordered"
}
\`\`\`

### Referrals

#### Create Referral

\`\`\`
POST /referrals
\`\`\`

Request Body:
\`\`\`json
{
  "patientId": "string",
  "referringProviderId": "string",
  "referredToProviderId": "string",
  "appointmentId": "string",
  "reason": "string",
  "notes": "string"
}
\`\`\`

Response:
\`\`\`json
{
  "id": "string",
  "patientId": "string",
  "referringProviderId": "string",
  "referredToProviderId": "string",
  "reason": "string",
  "status": "pending",
  "createdAt": "string"
}
\`\`\`

### Reviews

#### Get Provider Reviews

\`\`\`
GET /providers/{providerId}/reviews
\`\`\`

Response:
\`\`\`json
{
  "reviews": [
    {
      "id": "string",
      "patientName": "string",
      "rating": "number",
      "comment": "string",
      "createdAt": "string"
    }
  ],
  "pagination": {
    "total": "number",
    "pages": "number",
    "currentPage": "number",
    "limit": "number"
  }
}
\`\`\`

#### Create Review

\`\`\`
POST /reviews
\`\`\`

Request Body:
\`\`\`json
{
  "patientId": "string",
  "providerId": "string",
  "appointmentId": "string",
  "rating": "number",
  "comment": "string"
}
\`\`\`

Response:
\`\`\`json
{
  "id": "string",
  "patientId": "string",
  "providerId": "string",
  "rating": "number",
  "comment": "string",
  "createdAt": "string"
}
\`\`\`

### Screening Recommendations

#### Get Screening Recommendations

\`\`\`
GET /screening/recommendations
\`\`\`

Query Parameters:
- `age`: Patient age
- `gender`: Patient gender
- `riskFactors` (optional): Comma-separated list of risk factors

Response:
\`\`\`json
{
  "recommendations": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "ageRange": {
        "min": "number",
        "max": "number"
      },
      "gender": "string",
      "frequency": "string",
      "riskFactors": ["string"],
      "specialtyNeeded": "string",
      "importance": "string"
    }
  ]
}
\`\`\`

### AI Health Assistant

#### Chat with AI Assistant

\`\`\`
POST /ai/chat
\`\`\`

Request Body:
\`\`\`json
{
  "message": "string",
  "patientId": "string",
  "conversationId": "string"
}
\`\`\`

Response:
\`\`\`json
{
  "response": "string",
  "conversationId": "string"
}
\`\`\`

#### Analyze Symptoms

\`\`\`
POST /ai/analyze-symptoms
\`\`\`

Request Body:
\`\`\`json
{
  "symptoms": ["string"],
  "patientAge": "number",
  "patientGender": "string",
  "medicalHistory": ["string"]
}
\`\`\`

Response:
\`\`\`json
{
  "analysis": "string",
  "possibleConditions": ["string"],
  "recommendedSpecialties": ["string"],
  "urgencyLevel": "string",
  "selfCareAdvice": "string",
  "disclaimer": "string"
}
\`\`\`

#### Health Risk Assessment

\`\`\`
POST /ai/health-risk-assessment
\`\`\`

Request Body:
\`\`\`json
{
  "age": "number",
  "gender": "string",
  "height": "number",
  "weight": "number",
  "lifestyle": {
    "smoking": "boolean",
    "alcohol": "string",
    "exercise": "string",
    "diet": "string"
  },
  "medicalHistory": ["string"],
  "familyHistory": ["string"]
}
\`\`\`

Response:
\`\`\`json
{
  "riskAssessment": "string",
  "riskFactors": ["string"],
  "recommendations": ["string"],
  "preventiveMeasures": ["string"],
  "screeningRecommendations": ["string"]
}
\`\`\`

## Error Handling

All API endpoints return standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

Error responses follow this format:

\`\`\`json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
\`\`\`

## Webhooks

You can register webhook endpoints to receive real-time notifications for various events:

### Available Events

- `appointment.created`
- `appointment.updated`
- `appointment.cancelled`
- `prescription.created`
- `lab_order.created`
- `lab_order.results_available`
- `imaging_order.created`
- `imaging_order.results_available`
- `referral.created`
- `referral.status_changed`
- `provider.verification_status_changed`

### Webhook Registration

\`\`\`
POST /webhooks
\`\`\`

Request Body:
\`\`\`json
{
  "url": "string",
  "events": ["string"],
  "secret": "string"
}
\`\`\`

Response:
\`\`\`json
{
  "id": "string",
  "url": "string",
  "events": ["string"],
  "createdAt": "string"
}
\`\`\`

## Support

For API support, please contact api-support@healthcare-platform.com
\`\`\`

Now, let's create the API routes for the main resources:
