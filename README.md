
# **TransparenSee**  

## **Overview**  
TransparenSee is a web-based platform designed to enhance political accountability and transparency in Kenya through citizen-driven reporting and investigation of corruption cases. The platform enables anonymous reporting, collaborative investigations, and automated generation of formal case reports.

---

## **Features**  

### **Core Functionality**  
- **Anonymous Reporting System:** Submit reports without revealing identity  
- **Crowdsourced Investigations:** Collaborate with users to verify and expand cases  
- **Auto-Generated Case Reports:** Convert findings into formal documentation  
- **Evidence Management:** Secure upload and storage of supporting documentation  
- **Real-time Updates:** Live collaboration and notification system  
- **Data Visualization:** Interactive charts and graphs for trend analysis  

### **User Features**  
- Role-based access control  
- User reputation system  
- Badge rewards for contributions  
- Privacy controls  
- Investigation tracking  
- Report verification system  

---

## **Technology Stack**  

### **Frontend**  
- React.js  
- React Router (for navigation)  
- Recharts (for data visualization)  
- Bootstrap (for UI components)  
- Socket.io-client (for real-time features)  

### **Backend**  
- Django 5.1.1  
- Django REST Framework  
- PostgreSQL  
- JWT Authentication  
- WebSockets (for real-time communication)  

---

## **Installation**  

### **Prerequisites**  
- Python 3.8+  
- Node.js 14+  
- PostgreSQL 12+  
- Git  

---

### **Backend Setup**  
```bash
# Clone the repository
git clone https://github.com/KiprotichKibor/transparensee.git
cd transparensee

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

---

### **Frontend Setup**  
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

---

## **Environment Variables**  
Create a `.env` file in the root directory with the following variables:  

```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
ALLOWED_HOSTS=localhost,127.0.0.1
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_STORAGE_BUCKET_NAME=your-bucket-name
```

---

## **API Documentation**  
API documentation is available at `/api/docs/` when running the development server.  
The API follows RESTful principles and uses JWT for authentication.  

### **Key Endpoints**  
- `/api/reports/` - Report management  
- `/api/investigations/` - Investigation handling  
- `/api/contributions/` - User contributions  
- `/api/case-reports/` - Case report generation  
- `/api/users/` - User management  


---

## **Contributing**  
1. Fork the repository  
2. Create your feature branch:  
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes:  
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch:  
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request  


---

## **Project Structure**  
```plaintext
transparensee/
├── backend/
│   ├── core/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── utils.py
│   ├── templates/
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
└── README.md
```

---

## **Future Development**  
- Mobile application development  
- Blockchain integration for evidence integrity  
- Machine learning for fraud detection  
- Integration with government systems  
- Enhanced data analytics capabilities  

---

## **License**  
This project is licensed under the MIT License  

---

## **Acknowledgments**  
- Django REST Framework  
- React  
- Recharts  
- Bootstrap
- ALX Community
- ALX_SE
- Open-Source Community
---

## **Contact**  
Kiprotich Kibor - KiprotichKibor@github.com  
Project Link: https://github.com/KiprotichKibor/TransparentSee
---
