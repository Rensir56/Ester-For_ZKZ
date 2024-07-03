from django.http import HttpResponse, JsonResponse
from .utils import get_voice_answer_by_llm, get_text_answer_by_llm, get_video_answer_by_llm


def index(request):
    return HttpResponse("Hello, world. You're at the chukochen index.")


def read(request):
    if request.method == 'GET':
        temp = request.GET.get('voice_str')
        if temp is not None:
            return JsonResponse({"answer": get_voice_answer_by_llm(temp)}, status=200)
        else:
            return JsonResponse({"error": "No voice string"}, status=400)
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)
# Create your views here.


def write_answer(request):
    if request.method == 'GET':
        temp = request.GET.get('text_str')
        if temp is not None:
            return JsonResponse({"answer": get_text_answer_by_llm(temp)}, status=200)
        else:
            return JsonResponse({"error": "No Text Content"}, status = 400)
    else:
        return JsonResponse({"error": "Method not allowed"}, status = 405)


def play(request):
    if request.method == 'GET':
        temp = request.GET.get('video_str')
        if temp is not None:
            return JsonResponse({"answer": get_video_answer_by_llm(temp)}, status=200)
        else:
            return JsonResponse({"error": "No video string"}, status=400)