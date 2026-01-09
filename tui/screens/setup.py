"""Setup wizard sketch for the TUI."""

from textual.app import ComposeResult
from textual.containers import Container, Horizontal, Vertical
from textual.screen import Screen
from textual.widgets import Button, Footer, Header, Input, Static

from tui.widgets import HintBar, SectionTitle


class SetupScreen(Screen):
    """Collect credentials and device settings."""

    BINDINGS = [
        ("escape", "back", "Back"),
        ("s", "save", "Save"),
        ("d", "devices", "Devices"),
    ]

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        with Horizontal(id="body"):
            with Vertical(id="left"):
                yield SectionTitle("Credentials")
                with Container(classes="card"):
                    yield Static("Yandex token")
                    yield Input(placeholder="oauth_token", password=True, id="yandex-token")
                    yield Static("Telegram bot token")
                    yield Input(placeholder="telegram_bot_token", password=True, id="telegram-token")
                    yield Static("Ngrok token")
                    yield Input(placeholder="ngrok_token", password=True, id="ngrok-token")
                yield Button("Save", id="btn-save", variant="success")
                yield HintBar("S: save  D: devices  Esc: back")
            with Vertical(id="right"):
                yield SectionTitle("Device selection")
                with Container(classes="card"):
                    yield Static("Selected device: none", id="selected-device")
                    yield Button("Refresh devices", id="btn-devices")
                yield SectionTitle("Network")
                with Container(classes="card"):
                    yield Static("API URL")
                    yield Input(value="http://localhost:8000", id="api-url")
        yield Footer()

    def action_back(self) -> None:
        self.app.pop_screen()

    def action_save(self) -> None:
        self.app.push_screen("logs")

    def action_devices(self) -> None:
        self.app.push_screen("logs")
