# Database Schema Design

## Collections Overview

### 1. Users Collection
```
{
  _id: ObjectId,
  uid: String (Firebase UID),
  email: String,
  displayName: String,
  photoURL: String,
  phone: String,
  bio: String,
  skills: [ObjectId], // References to Skill
  ratings: {
    average: Number,
    count: Number
  },
  isVerified: Boolean,
  role: enum ['user', 'instructor', 'admin'],
  location: {
    latitude: Number,
    longitude: Number,
    city: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Skills Collection
```
{
  _id: ObjectId,
  title: String,
  description: String,
  instructor: ObjectId (Reference to User),
  category: String,
  subcategory: String,
  price: Number,
  currency: String,
  duration: Number, // in minutes
  level: enum ['beginner', 'intermediate', 'advanced'],
  image: String (URL),
  tags: [String],
  availability: [
    {
      day: String,
      slots: [String]
    }
  ],
  rating: Number,
  reviewCount: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Bookings Collection
```
{
  _id: ObjectId,
  student: ObjectId (Reference to User),
  instructor: ObjectId (Reference to User),
  skill: ObjectId (Reference to Skill),
  scheduledDate: Date,
  scheduledTime: String,
  duration: Number,
  status: enum ['pending', 'confirmed', 'completed', 'cancelled'],
  totalPrice: Number,
  paymentStatus: enum ['unpaid', 'paid', 'refunded'],
  notes: String,
  meetingLink: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Reviews Collection
```
{
  _id: ObjectId,
  booking: ObjectId (Reference to Booking),
  reviewer: ObjectId (Reference to User),
  reviewee: ObjectId (Reference to User),
  skill: ObjectId (Reference to Skill),
  rating: Number (1-5),
  comment: String,
  createdAt: Date
}
```

### 5. Messages Collection
```
{
  _id: ObjectId,
  sender: ObjectId (Reference to User),
  receiver: ObjectId (Reference to User),
  conversationId: String,
  text: String,
  isRead: Boolean,
  readAt: Date,
  createdAt: Date
}
```

## Indexes for Performance
```
- Users: uid (unique), email (unique)
- Skills: instructor, category, isActive
- Bookings: student, instructor, skill, status
- Messages: conversationId, createdAt
- Reviews: reviewee, skill
```

## Relationships
```
User ---> (instructor) ---> Skill
         (has one or more)
         
User ---> (student/instructor) ---> Booking
         (participates in)
         
Booking ---> Review
        (receives after completion)
        
Booking ---> Message (Conversation)
        (participants can chat)
```
