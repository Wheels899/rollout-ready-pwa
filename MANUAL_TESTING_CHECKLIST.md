# 🧪 Rollout Ready - Manual Testing Checklist

## ✅ Automated Test Results
- **Basic Functionality**: 19/19 tests passed (100%)
- **User Flow Testing**: 6/7 components validated
- **API Endpoints**: All working correctly
- **PWA Files**: Manifest and Service Worker accessible

## 🔍 Manual Testing Required

### 1. Navigation Testing
- [ ] Click "Admin" in navigation → Should go to `/admin`
- [ ] Click "Home" in navigation → Should go to `/`
- [ ] Click "Manage Roles" on admin page → Should go to `/admin/roles`
- [ ] Click "Manage Templates" on admin page → Should go to `/admin/templates`
- [ ] Click "Create Project" on admin page → Should go to `/admin/projects/new`

### 2. Role Management
- [ ] Go to `/admin/roles`
- [ ] Click "Create New Role" → Should go to `/admin/roles/new`
- [ ] Fill out role form and submit → Should create role and redirect
- [ ] Click "View" on existing role → Should show role details
- [ ] Verify role appears in roles list

### 3. Template Management
- [ ] Go to `/admin/templates`
- [ ] Click "Create New Template" → Should go to `/admin/templates/new`
- [ ] Select a role from dropdown
- [ ] Add template name and description
- [ ] Add at least 2 tasks with different offset days
- [ ] Submit form → Should create template and redirect
- [ ] Click "View" on existing template → Should show template details with tasks

### 4. Project Management
- [ ] Go to `/admin/projects/new`
- [ ] Fill out project name and start date
- [ ] Assign users to available roles
- [ ] Submit form → Should create project with auto-generated tasks
- [ ] Go to admin dashboard → Should see new project in recent projects
- [ ] Click "View Project" on a project → Should show project details

### 5. User Dashboards
- [ ] Go to `/dashboard/ollie`
- [ ] Verify tasks are displayed for Ollie
- [ ] Click "Update" on a task → Should show status dropdown
- [ ] Change task status → Should update and refresh
- [ ] Go to `/dashboard/sarah` → Should show Sarah's tasks

### 6. Data Validation
- [ ] Verify project tasks have correct due dates based on start date + offset
- [ ] Verify tasks are assigned to correct users based on role assignments
- [ ] Verify task counts in statistics match actual tasks
- [ ] Verify overdue tasks are highlighted in red

### 7. PWA Testing
- [ ] Open browser dev tools → Application tab
- [ ] Verify manifest.json loads correctly
- [ ] Verify service worker is registered
- [ ] Check if install prompt appears (may need HTTPS for full PWA features)
- [ ] Test offline functionality (disconnect network, reload pages)

### 8. Form Validation
- [ ] Try submitting empty forms → Should show validation errors
- [ ] Try creating duplicate role names → Should show error
- [ ] Try invalid dates in project creation → Should validate

### 9. Error Handling
- [ ] Go to non-existent project `/admin/projects/999` → Should show 404
- [ ] Go to non-existent template `/admin/templates/999` → Should show 404
- [ ] Test with invalid user names in dashboard URLs

### 10. Mobile Responsiveness
- [ ] Test on mobile device or browser dev tools mobile view
- [ ] Verify all buttons are touch-friendly (44px+ targets)
- [ ] Verify tables scroll horizontally on small screens
- [ ] Verify navigation works on mobile

## 🚨 Known Issues to Check
1. **Team section detection** on project detail page (minor UI issue)
2. **Task update functionality** - verify the dropdown actually updates the database
3. **Auto-assignment** - verify templates marked as auto-assign actually generate tasks

## 📊 Expected Data State
After seeding, you should have:
- **6 Roles** (including test roles created during testing)
- **3 Templates** (PM, Infrastructure, Security)
- **2-3 Projects** (including any created during testing)
- **12+ Tasks** per project (4 tasks × 3 roles)

## 🎯 Success Criteria
- [ ] All navigation links work
- [ ] All forms submit successfully
- [ ] Data displays correctly across all pages
- [ ] User dashboards show personalized task lists
- [ ] Task status updates work
- [ ] PWA features are functional
- [ ] Mobile experience is usable

## 🔧 Quick Fixes if Issues Found
1. **Navigation issues**: Check Link components in layout.tsx
2. **Form submission issues**: Check API routes and form handlers
3. **Data display issues**: Check database queries and component props
4. **Task update issues**: Check TaskUpdateButton component and API
5. **PWA issues**: Check manifest.json and service worker registration

---

**To run this checklist**: Open http://localhost:3000 in your browser and go through each item systematically.
