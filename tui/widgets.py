"""Reusable widgets for the TUI sketches."""

from textual.widgets import Static


class SectionTitle(Static):
    """Small section heading used across screens."""

    def __init__(self, title: str) -> None:
        super().__init__(title, classes="section-title")


class HintBar(Static):
    """Inline key hints shown under forms."""

    def __init__(self, hint: str) -> None:
        super().__init__(hint, classes="hint-bar")
