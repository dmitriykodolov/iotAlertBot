"""Dashboard screen sketch for the TUI."""

from textual.app import ComposeResult
from textual.containers import Container, Horizontal, Vertical
from textual.screen import Screen
from textual.widgets import Button, DataTable, Footer, Header, Static

from tui.widgets import HintBar, SectionTitle


class DashboardScreen(Screen):
    """High-level status and quick actions."""

    BINDINGS = [
        ("a", "start_alert", "Start alert"),
        ("r", "start_rainbow", "Start rainbow"),
        ("s", "stop", "Stop"),
    ]

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        with Horizontal(id="body"):
            with Vertical(id="left"):
                yield SectionTitle("Device status")
                yield Static("Lamp: online", id="device-status", classes="card")
                yield Static("Color: #FF0000", classes="card")
                yield Static("Brightness: 70%", classes="card")
                yield SectionTitle("Quick actions")
                with Container(classes="card"):
                    yield Button("Start alert", id="btn-start-alert", variant="success")
                    yield Button("Start rainbow", id="btn-start-rainbow")
                    yield Button("Stop", id="btn-stop", variant="error")
                yield HintBar("A: alert  R: rainbow  S: stop")
            with Vertical(id="right"):
                yield SectionTitle("Recent events")
                yield DataTable(id="events", classes="card")
        yield Footer()

    def on_mount(self) -> None:
        table = self.query_one("#events", DataTable)
        table.add_columns("Time", "Event")
        table.add_rows(
            [
                ("12:30", "Rainbow alert started"),
                ("12:25", "Alert finished"),
                ("12:20", "Device online"),
            ]
        )
        table.cursor_type = "row"

    def action_start_alert(self) -> None:
        self.app.push_screen("alerts")

    def action_start_rainbow(self) -> None:
        self.app.push_screen("alerts")

    def action_stop(self) -> None:
        self.app.push_screen("logs")
