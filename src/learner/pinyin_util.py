"""
pinyin_util.py — convert mixed Chinese/Latin text to spaced toned pinyin.

Non-Han characters (punctuation, English words, the cloze blank ``___``) are
preserved verbatim; Han characters are replaced with their toned pinyin and
separated from neighbours by single spaces.
"""
from pypinyin import pinyin, Style


def _is_han(ch: str) -> bool:
    return "一" <= ch <= "鿿"


def prompt_pinyin(text: str) -> str:
    if not text or not any(_is_han(c) for c in text):
        return ""

    out: list[str] = []
    buf: list[str] = []

    def flush_buf():
        if buf:
            han = "".join(buf)
            syllables = [seg[0] for seg in pinyin(han, style=Style.TONE)]
            out.append(" ".join(syllables))
            buf.clear()

    for ch in text:
        if _is_han(ch):
            buf.append(ch)
        else:
            flush_buf()
            out.append(ch)
    flush_buf()

    # collapse runs of whitespace and trim
    return " ".join("".join(out).split())
