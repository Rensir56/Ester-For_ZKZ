from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("voice/", views.read),
    path("text/", views.write_answer)
]