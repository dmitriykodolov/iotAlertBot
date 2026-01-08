.ONESHELL:

env:
	[ -x .venv/bin/python ] || python3 -m venv .venv
	. .venv/bin/activate
	set -a
	. .env
	set +a
	.venv/bin/python -m pip install -r requrments.txt

api:
	$(MAKE) env
	.venv/bin/python app/main.py

ngrok:
	$(MAKE) env
	.venv/bin/python hello-ngrok/example.py

start:
	make api | make ngrok