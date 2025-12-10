# Admin Dashboard - Complete Implementation Guide

## 🎉 Overview

Your SRMK Oil Mill e-commerce website now has a **complete admin dashboard** with role-based access control! The system supports three user roles:
- **CUSTOMER**: Regular customers (existing functionality)
- **ADMIN**: Full system access
- **DELIVERY**: Limited access to assigned orders

## 🔐 Authentication & Access

### Admin Portal URL
```
http://localhost:4000/admin
```

### Initial Admin Account (Default Credentials)
```
Phone: 9999999999
Password: admin123
```
⚠️ **Change this password immediately after first login!**

### Role-Based Access
- **Customers**: Access via `http://localhost:4000/auth` (existing)
- **Admin/Delivery**: Access via `http://localhost:4000/admin`
- Middleware automatically redirects users based on their role

## 📊 Admin Dashboard Features

### 1. Dashboard (Home)
- **Metrics Display**:
  - Total Orders
  - Pending Deliveries
  - Delivered Orders
  - Active Delivery Agents (admin only)
- **Quick Actions**: Links to frequently used pages

### 2. Products Management (Admin Only)
**Full CRUD Operations**:
- ✅ Create new products
- ✅ Edit existing products (price, stock, name, offers, etc.)
- ✅ Delete products
- ✅ Search and filter by category
- ✅ Toggle product visibility (active/inactive)

**Product Fields**:
- Names (Tamil & English)
- Descriptions (bilingual)
- Price, Unit, Stock Quantity
- Discount percentage
- Offer text (bilingual)
- Category, SKU
- Image URL
- Status flags (inStock, isActive)

### 3. Orders Management (Admin & Delivery)
**Admin Features**:
- View all orders
- Filter by status, delivery status, pincode
- Assign orders to delivery agents
- Update delivery status
- Search by order ID, phone, or pincode

**Delivery User Features**:
- View assigned orders
- Self-assign unassigned orders
- Mark orders as:
  - Picked Up
  - In Transit
  - Delivered

### 4. Delivery Management (Admin Only)
- Create delivery agent accounts
- View all delivery agents
- Activate/Deactivate agents
- Delete agents (only if no pending orders)
- Track assigned order count per agent

### 5. Customers (Admin Only)
- View all customer accounts
- See customer statistics:
  - Total customers
  - Total orders
  - Average orders per customer
- Search by name or phone
- View order history count per customer

### 6. Reports & Analytics (Admin Only)
**Features**:
- Revenue statistics (total, average order value)
- Orders over time (visual chart)
- Top-selling products
- Date range filters (7, 30, 90, 365 days)
- **CSV Export**: Download orders report

### 7. Settings (Admin Only)
- Role management toggles
- Delivery zones configuration
- Product categories management

## 🗃️ Database Schema Updates

### New Fields Added to Existing Tables

#### `User` Table
```prisma
role              UserRole  @default(CUSTOMER)  // CUSTOMER | ADMIN | DELIVERY
isActive          Boolean   @default(true)
assignedOrders    Order[]   @relation("DeliveryAgent")
```

#### `Order` Table
```prisma
deliveryStatus    DeliveryStatus  @default(PENDING)
assignedToId      String?
assignedTo        User?           @relation("DeliveryAgent")
```

#### `Product` Table (Enhanced)
```prisma
stockQuantity     Int       @default(0)
discount          Int       @default(0)
offerTextTa       String?
offerTextEn       String?
category          String?
sku               String?   @unique
isActive          Boolean   @default(true)
```

### New Enums
```prisma
enum UserRole {
  CUSTOMER
  ADMIN
  DELIVERY
}

enum DeliveryStatus {
  PENDING
  ASSIGNED
  PICKED_UP
  IN_TRANSIT
  DELIVERED
}
```

## 🛠️ API Routes (Role-Protected)

### Admin Stats
- `GET /api/admin/stats` - Dashboard metrics

### Products (Admin Only)
- `GET /api/admin/products` - List all products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product

### Orders (Admin & Delivery)
- `GET /api/admin/orders` - List orders (filtered by role)
- `POST /api/admin/orders/[id]/assign` - Assign to delivery agent
- `PUT /api/admin/orders/[id]/delivery-status` - Update status

### Delivery Agents (Admin Only)
- `GET /api/admin/delivery-agents` - List agents
- `POST /api/admin/delivery-agents` - Create agent
- `PUT /api/admin/delivery-agents/[id]` - Toggle active status
- `DELETE /api/admin/delivery-agents/[id]` - Delete agent

### Customers (Admin Only)
- `GET /api/admin/customers` - List all customers

### Reports (Admin Only)
- `GET /api/admin/reports?days=30` - Get report data
- `GET /api/admin/reports/export?format=csv` - Export CSV

### Settings (Admin Only)
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update settings

## 🚀 Getting Started

### 1. Start the Development Server
```bash
cd /Users/tharanic/Documents/GitHub/SRMK-Oil-Bulk
npm run dev
```
Server runs on: `http://localhost:4000`

### 2. Access Admin Portal
Navigate to: `http://localhost:4000/admin`

### 3. Login with Default Admin
- Phone: `9999999999`
- Password: `admin123`

### 4. Create Delivery Agents
1. Go to **Delivery Management**
2. Click **Add Delivery Agent**
3. Enter name, phone, and password
4. Agent can now log in at `/admin`

### 5. Manage Products
1. Go to **Products**
2. Add/Edit products with all necessary fields
3. Set stock quantities, discounts, and offers

### 6. Process Orders
**As Admin**:
1. View orders in **Orders** tab
2. Assign to delivery agents
3. Monitor delivery status

**As Delivery Agent**:
1. View **My Orders** (assigned to you)
2. Self-assign from unassigned orders
3. Update status as you deliver

## 🔒 Security Features

### Role-Based Authorization
- Middleware protects all `/admin/dashboard` routes
- API routes validate user role in every request
- Separate login portals for customers vs admin/delivery

### Password Security
- Bcrypt hashing (10 rounds)
- OTP-based password reset (mock: 123456)
- Account deactivation support

### Data Protection
- Delivery users can only see their assigned orders
- Admins have full access to all data
- Customers remain isolated from admin portal

## 📱 Responsive Design

All admin pages are fully responsive with:
- Mobile-friendly sidebar (collapsible)
- Touch-optimized controls
- Responsive tables and forms
- Tailwind CSS utility classes

## 🎨 UI/UX Features

- **Sidebar Navigation**: Role-based menu items
- **Loading States**: Spinners during data fetch
- **Toast Notifications**: Success/error messages
- **Modal Forms**: Clean product/agent creation
- **Color-Coded Status**: Visual order/delivery status
- **Search & Filters**: Easy data navigation

## 📝 Notes & Best Practices

### For Admin Users
- Regularly monitor delivery agent performance
- Keep product stock updated
- Review reports weekly
- Export data for backups

### For Delivery Users
- Check assigned orders daily
- Update status in real-time
- Self-assign nearby orders
- Mark delivered promptly

### Development Tips
- Database uses direct connection for local (port 5432)
- Production should use pooler (port 6543)
- Build succeeds with warnings (acceptable)
- NextAuth uses JWT sessions (no adapter)

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Database Issues
```bash
# Regenerate Prisma client
npx prisma generate

# Check database connection
npx prisma db pull
```

### Auth Issues
- Ensure `NEXTAUTH_SECRET` is set in `.env`
- Check role in session token
- Verify middleware matcher patterns

## 🚀 Deployment to Vercel

### Environment Variables Required
```env
# Database (use Transaction Pooler for production)
DATABASE_URL="postgresql://postgres:PASSWORD@HOST:6543/postgres?pgbouncer=true&connection_limit=1"

# NextAuth
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://yourdomain.com"

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-key"
```

### Build Settings
- Build Command: `npm run build`
- Start Command: `npm run start`
- Node Version: 20.x

## ✅ What's Implemented

- [x] Database schema with roles and delivery fields
- [x] Seed script for initial admin
- [x] Role-based session management
- [x] Admin authentication page with OTP reset
- [x] Protected routes middleware
- [x] Responsive dashboard layout
- [x] Products CRUD (full management)
- [x] Orders management (admin & delivery views)
- [x] Delivery agent management
- [x] Customer listing
- [x] Reports & analytics with CSV export
- [x] Settings page
- [x] All API routes with authorization
- [x] Error handling and loading states
- [x] Build successful, dev server running

## 🎯 Next Steps (Optional Enhancements)

1. **Email/SMS Notifications**: Integrate with Twilio/SendGrid
2. **Real-time Updates**: Add WebSocket for live order tracking
3. **Advanced Analytics**: Charts with Recharts or Chart.js
4. **Image Upload**: Cloudinary or AWS S3 for product images
5. **Audit Logs**: Track admin actions
6. **Multi-language Admin**: Extend i18n to admin portal
7. **Batch Operations**: Bulk product updates
8. **Delivery Route Optimization**: Integrate Google Maps Directions API

## 📞 Support

For questions or issues:
1. Check this guide first
2. Review code comments
3. Check Next.js and Prisma documentation
4. Test in development before deploying

---

**🎉 Congratulations! Your complete admin dashboard is ready to use!**

Access it at: `http://localhost:4000/admin` (Login: 9999999999 / admin123)

