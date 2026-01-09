"""Alert configuration screen sketch for the TUI."""

from textual.app import ComposeResult
from textual.containers import Container, Horizontal, Vertical
from textual.screen import Screen
from textual.widgets import Button, Footer, Header, Input, Static

from tui.widgets import HintBar, SectionTitle


class AlertsScreen(Screen):
    """Configure and trigger alert scenarios."""

    BINDINGS = [
        ("escape", "back", "Back"),
        ("s", "start", "Start"),
    ]

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        with Horizontal(id="body"):
            with Vertical(id="left"):
                yield SectionTitle("Alert settings")
                with Container(classes="card"):
                    yield Static("Color 1")
                    yield Input(value="#FF0000", id="color-1")
                    yield Static("Color 2")
                    yield Input(value="#E30306", id="color-2")
                    yield Static("Duration (sec)")
                    yield Input(value="10", id="duration")
                    yield Static("Blink interval (sec)")
                    yield Input(value="0.5", id="interval")
                yield HintBar("S: start alert  Esc: back")
            with Vertical(id="right"):
                yield SectionTitle("Presets")
                with Container(classes="card"):
                    yield Button("Emergency red", id="preset-red")
                    yield Button("Warm yellow", id="preset-yellow")
                    yield Button("Ocean blue", id="preset-blue")
                yield SectionTitle("Preview")
                yield Static("Preview canvas", classes="card", id="preview")
        yield Footer()

    def action_back(self) -> None:
        self.app.pop_screen()

    def action_start(self) -> None:
        self.app.push_screen("logs")
