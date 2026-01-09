"""Textual app entry point for the TUI sketches."""

from __future__ import annotations

import os
import sys

from textual.app import App

if __package__ in (None, ""):
    sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from tui.screens import AlertsScreen, DashboardScreen, LogsScreen, SetupScreen


class IotAlertApp(App):
    CSS_PATH = "tui.css"
    TITLE = "IoT Alert Bot"
    SUB_TITLE = "TUI sketches"

    BINDINGS = [
        ("d", "show_dashboard", "Dashboard"),
        ("a", "show_alerts", "Alerts"),
        ("s", "show_setup", "Setup"),
        ("l", "show_logs", "Logs"),
        ("q", "quit", "Quit"),
    ]

    def on_mount(self) -> None:
        self.install_screen(DashboardScreen(), name="dashboard")
        self.install_screen(AlertsScreen(), name="alerts")
        self.install_screen(SetupScreen(), name="setup")
        self.install_screen(LogsScreen(), name="logs")
        self.push_screen("dashboard")

    def action_show_dashboard(self) -> None:
        self.push_screen("dashboard")

    def action_show_alerts(self) -> None:
        self.push_screen("alerts")

    def action_show_setup(self) -> None:
        self.push_screen("setup")

    def action_show_logs(self) -> None:
        self.push_screen("logs")


if __name__ == "__main__":
    IotAlertApp().run()
