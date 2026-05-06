from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/',         include('users.urls')),
    path('api/national-dex/', include('national_dex.urls')),
    path('api/binders/',      include('binders.urls')),
]
