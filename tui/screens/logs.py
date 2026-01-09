"""Logs screen sketch for the TUI."""

from textual.app import ComposeResult
from textual.containers import Vertical
from textual.screen import Screen
from textual.widgets import Footer, Header, Log

from tui.widgets import HintBar, SectionTitle


class LogsScreen(Screen):
    """Show API and device events."""

    BINDINGS = [
        ("escape", "back", "Back"),
        ("c", "clear", "Clear"),
    ]

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)
        with Vertical(id="body"):
            yield SectionTitle("Event log")
            yield Log(id="event-log", highlight=True)
            yield HintBar("C: clear  Esc: back")
        yield Footer()

    def on_mount(self) -> None:
        log = self.query_one("#event-log", Log)
        log.write_line("[system] TUI started")
        log.write_line("[api] Waiting for next request")

    def action_back(self) -> None:
        self.app.pop_screen()

    def action_clear(self) -> None:
        log = self.query_one("#event-log", Log)
        log.clear()
