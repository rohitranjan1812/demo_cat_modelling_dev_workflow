# 🔐 Login Credentials - CAT Modelling Application

## Available Demo Users

Your CAT Modelling application is now running with three demo user accounts. Use the following credentials to login:

---

## 👤 User 1: Analyst (Recommended for Testing)

```
Username:    demo
Email:       demo@catmodelling.local
Password:    DemoPass123!
Role:        Analyst
Permissions: Read & Write data, Manage data
```

**Use this account for:** 
- Testing simulation creation and management
- Creating and modifying accounts, policies, hazards
- General platform exploration

---

## 🛡️ User 2: Admin (Full Access)

```
Username:    admin
Email:       admin@catmodelling.local
Password:    AdminPass123!
Role:        Admin
Permissions: Full system access
```

**Use this account for:**
- System configuration and administration
- User management
- System-wide data management
- Emergency access

---

## 👁️ User 3: Viewer (Read-Only Access)

```
Username:    viewer
Email:       viewer@catmodelling.local
Password:    ViewerPass123!
Role:        Viewer
Permissions: Read-only access
```

**Use this account for:**
- Viewing reports and dashboards
- Reading simulation results
- General data inspection
- Testing read-only workflows

---

## 🌐 Application URLs

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:3001 |
| **Health Check** | http://localhost:3001/health |
| **API Documentation** | http://localhost:3001/api/v1 |

---

## ✅ Login Steps

1. **Open the application:** Navigate to `http://localhost:3000`
2. **Enter credentials:** Use one of the usernames/passwords above
3. **Click Login:** You'll be directed to the dashboard
4. **Explore:** Start using the application features

---

## 🔄 Token Information

- **Access Token Expiry:** 7 days
- **Refresh Token Expiry:** 7 days
- **Session Management:** Tokens are securely stored

---

## 🔐 Password Policy

All demo passwords meet security requirements:
- ✅ At least 8 characters
- ✅ Contains uppercase letters (A-Z)
- ✅ Contains lowercase letters (a-z)
- ✅ Contains numbers (0-9)
- ✅ Contains special characters (@$!%*?&)

---

## 📝 Notes

- **Do NOT use** these credentials in production
- **Create new users** through the admin interface for production use
- **Change passwords** regularly in production environments
- **Revoke sessions** if needed from the user profile settings

---

## 🆘 Troubleshooting

### "Invalid credentials" error
- Check that you're using the exact username (case-sensitive)
- Verify the password is typed correctly
- Ensure the backend is running on port 3001

### Can't see login form
- Clear browser cache (Ctrl+Shift+Delete)
- Try incognito/private mode
- Check that frontend is running on port 3000

### Lost credentials
- This guide will help you recreate demo users:
  ```bash
  node setup-demo-users.js
  ```

---

**Last Updated:** October 28, 2025  
**Application Status:** ✅ Operational

For more information, see:
- `ARCHITECTURE_AND_GUIDE.md` - System architecture
- `DEPLOYMENT_STATUS.md` - Current deployment status
- `README.md` - Project overview
