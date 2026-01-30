import tkinter as tk
from tkinter import ttk, messagebox
import time
import json
import os
from screeninfo import get_monitors
import ctypes
from ctypes import wintypes

# --- Work Area Manager ---
class RECT(ctypes.Structure):
    _fields_ = [
        ('left', ctypes.c_long),
        ('top', ctypes.c_long),
        ('right', ctypes.c_long),
        ('bottom', ctypes.c_long)
    ]

class WorkAreaManager:
    SPI_GETWORKAREA = 48
    SPI_SETWORKAREA = 47
    
    @staticmethod
    def get_screen_size():
        user32 = ctypes.windll.user32
        return user32.GetSystemMetrics(0), user32.GetSystemMetrics(1)
        
    @staticmethod
    def reset():
        # Restore full screen work area (Primary Monitor)
        # We assume standard taskbar handling will be restored by Windows or we set to full?
        # Actually SPI_SETWORKAREA with null/full rect usually resets? 
        # Better: Get full screen size and set that? Or just let Windows handle it?
        # Windows API: "To reload the system parameters, call SystemParametersInfo with the uiAction parameter set to SPI_SETWORKAREA and the pvParam parameter set to NULL." doesn't exist?
        # We should probably store the ORIGINAL rect before changing it.
        pass # We will implement store/restore in instance
        
    def __init__(self):
        self.original_rect = RECT()
        self.active = False
        
    def store_current(self):
        if not self.active:
            ctypes.windll.user32.SystemParametersInfoW(self.SPI_GETWORKAREA, 0, ctypes.byref(self.original_rect), 0)

    def set_reserve(self, right_width, bottom_height):
        if not self.active:
            self.store_current()
            self.active = True
            
        # Get Full Screen Metrics (Primary)
        w, h = self.get_screen_size()
        
        # New Rect
        # Assuming standard taskbar was at bottom, our reservation might overlap or replace it.
        # We define the NEW Work Area.
        # It should be (0, 0) to (Width - Right, Height - Bottom)
        
        new_rect = RECT()
        new_rect.left = 0
        new_rect.top = 0
        new_rect.right = w - int(right_width)
        new_rect.bottom = h - int(bottom_height)
        
        # Apply
        ctypes.windll.user32.SystemParametersInfoW(self.SPI_SETWORKAREA, 0, ctypes.byref(new_rect), 0x2) # 0x2 = SPIF_SENDWININICHANGE

    def restore(self):
        if self.active:
            ctypes.windll.user32.SystemParametersInfoW(self.SPI_SETWORKAREA, 0, ctypes.byref(self.original_rect), 0x2)
            self.active = False

# Global Instance
work_area_mgr = WorkAreaManager()
import atexit
atexit.register(work_area_mgr.restore)
# -------------------------

# Default Schedule Data (Template)
DEFAULT_SCHEDULE = [
    {"time": "18:20 as 18:25", "sigla": "Videos", "content": "Vídeo de Abertura", "duration": "5min", "lead": "Vídeo", "color": "#808080"}, 
    {"time": "18:25 as 18:30", "sigla": "ORA", "content": "Oração Inicial", "duration": "5min", "lead": "", "color": "#FFC107"}, 
    {"time": "18:30 as 18:55", "sigla": "MSC", "content": "Lagoinha Music", "duration": "25min", "lead": "Lagoinha Music", "color": "#FFEB3B"}, 
    {"time": "18:55 as 19:00", "sigla": "ORA", "content": "ORAÇÃO INTERCESSÃO", "duration": "5min", "lead": "", "color": "#D2691E"}, 
    {"time": "19:00 as 19:05", "sigla": "PLV", "content": "LAGOINHA NEWS", "duration": "5min", "lead": "", "color": "#FF8C00"}, 
    {"time": "19:05 as 19:09", "sigla": "PLV", "content": "PALAVRA DE OFERTA", "duration": "4min", "lead": "", "color": "#E0E0E0"}, 
    {"time": "19:09 as 19:14", "sigla": "MSC", "content": "Lagoinha AMusic", "duration": "5min", "lead": "Lagoinha Music", "color": "#FFEB3B"}, 
    {"time": "19:14 as 19:16", "sigla": "ORA", "content": "ORAÇÃO PELA OFERTA", "duration": "2min", "lead": "", "color": "#90EE90"}, 
    {"time": "19:16 as 19:56", "sigla": "PLV", "content": "PALAVRA DO CULTO", "duration": "40min", "lead": "", "color": "#4682B4"}, 
    {"time": "19:56 as 19:58", "sigla": "ORA", "content": "APELO FINAL", "duration": "2min", "lead": "Pra. Cristiane", "color": "#E0E0E0"}, 
    {"time": "19:58 as 20:00", "sigla": "FIM", "content": "FINALIZAÇÃO", "duration": "2min", "lead": "Pra. Cristiane", "color": "#FF0000"}, 
]

class MarqueeApp:
    def __init__(self, root, control_panel):
        self.root = root
        self.control_panel = control_panel
        self.root.title("Letreiro Digital - Display")
        
        # Default geometry vars
        self.monitor_x = 0
        self.monitor_y = 0
        self.monitor_width = self.root.winfo_screenwidth()
        self.monitor_height = self.root.winfo_screenheight()
        
        self.bar_height = 80
        
        self.root.overrideredirect(True)
        self.root.attributes("-topmost", True)
        
        self.bg_color = "#CC0000"
        self.text_color = "#FFFF00"
        
        self.root.configure(bg=self.bg_color)
        
        self.current_text = ""
        self.show_banner = False 
        
        self.label = tk.Label(
            root, 
            text=self.current_text, 
            font=("Arial", 40, "bold"), 
            bg=self.bg_color, 
            fg=self.text_color
        )
        self.label.pack(expand=True, fill='both')
        
        self.x_pos = self.monitor_width
        self.banner_x = self.monitor_x
        self.banner_y = self.monitor_y
        
        # Explicit positioning variables for other windows
        self.clock_x = None
        self.clock_y = None
        self.schedule_x = None
        self.schedule_y = None
        
        self.clock_width = 200
        self.clock_height = 100
        self.clock_window_scale = 1.0
        self.clock_font_size = 30
        self.schedule_font_size = 12
        self.schedule_width = 300
        
        # Timer specific
        self.timer_seconds = 0
        self.timer_running = False
        
        self.create_clock()
        self.create_schedule_window()
        
        # Banner Dragging
        self.root.bind("<ButtonPress-1>", self.StartMove)
        self.root.bind("<ButtonRelease-1>", self.StopMove)
        self.root.bind("<B1-Motion>", self.OnMotion_Banner)
        
        self.blink_state = False
        
        # Initial Geometry
        self.update_geometry()
        
        self.scrolling = True
        self.scroll()
        
        # HIDE ON START
        self.root.withdraw()
        if hasattr(self, 'clock_win'):
            self.clock_win.withdraw()
            
    def set_monitor_config(self, x, y, width, height):
        self.monitor_x = x
        self.monitor_y = y
        self.monitor_width = width
        self.monitor_height = height
        
        # Reset positions to defaults relative to new monitor
        self.reset_positions_to_monitor()
        
        self.update_geometry()

    def reset_positions_to_monitor(self):
        # Banner: Top Left
        self.banner_x = self.monitor_x
        self.banner_y = self.monitor_y
        
        # Clock: Bottom Right
        # We need current dimensions 
        cw = self.clock_width
        ch = self.clock_height
        self.clock_x = self.monitor_x + self.monitor_width - cw - 20
        self.clock_y = self.monitor_y + self.monitor_height - ch - 20
        
        # Schedule: Left, below Banner area roughly
        self.schedule_x = self.monitor_x + 50
        self.schedule_y = self.monitor_y + 150

    def set_banner_position(self, x, y):
        self.banner_x = x
        self.banner_y = y
        # Update just the banner window
        geom_str = f"{self.monitor_width}x{self.bar_height}+{self.banner_x}+{self.banner_y}"
        self.root.geometry(geom_str)

    def update_geometry(self):
        # Update Banner Geometry
        geom_str = f"{self.monitor_width}x{self.bar_height}+{self.banner_x}+{self.banner_y}"
        self.root.geometry(geom_str)
        
        # Update Clock Geometry
        if hasattr(self, 'clock_win'):
            w = self.clock_width
            h = self.clock_height
            
            # Initialize pos if missing
            if self.clock_x is None: self.clock_x = self.monitor_x + self.monitor_width - w - 20
            if self.clock_y is None: self.clock_y = self.monitor_y + self.monitor_height - h - 20
            
            self.clock_win.geometry(f"{w}x{h}+{self.clock_x}+{self.clock_y}")
            
        # Update Schedule Geometry
        if hasattr(self, 'schedule_win'):
            # Initialize pos if missing
            if self.schedule_x is None: self.schedule_x = self.monitor_x + 50
            if self.schedule_y is None: self.schedule_y = self.monitor_y + 150
            
            # Get current size
            current_w = self.schedule_width
            # We rely on previous height or default, as we can't easily force calc here without flashing
            current_h = self.schedule_win.winfo_height() 
            if current_h < 50: current_h = 400 
            
            self.schedule_win.geometry(f"{current_w}x{current_h}+{self.schedule_x}+{self.schedule_y}")

    def update_text(self, text, color, show_banner, show_clock, show_timer, show_schedule, text_mode):
        self.current_text = text
        self.text_color = color
        self.label.config(fg=self.text_color)
        self.label.config(text=self.current_text)
        
        # Reset scroll start to far right of window width
        self.x_pos = self.monitor_width 
        
        # Apply Visibility
        self.set_visibility(show_clock, show_timer, show_banner, show_schedule)

    def start_countdown(self, duration_seconds):
        if duration_seconds:
             self.start_timer(duration_seconds)
        else:
             self.stop_timer()

    def set_visibility(self, show_clock, show_timer, show_banner, show_schedule):
        self.show_banner = show_banner
        
        if show_banner:
            self.root.deiconify()
            self.label.config(text=self.current_text)
        else:
            self.root.withdraw()
            
        if not show_clock and not show_timer:
            self.clock_win.withdraw()
        else:
            self.clock_win.deiconify()
            if show_clock:
                self.clock_label.pack(padx=20, pady=(10, 0))
            else:
                self.clock_label.pack_forget() 
            if show_timer:
                self.timer_display.pack(padx=20, pady=(0, 10))
            else:
                self.timer_display.pack_forget()

        if show_schedule:
            self.schedule_win.deiconify()
        else:
            self.schedule_win.withdraw()

    def set_screen_offset(self, x_offset):
        # Deprecated by set_monitor_config, kept for interface compat if needed
        pass

    def set_clock_font_size(self, size):
        self.clock_font_size = int(size)
        timer_font_size = int(size * 0.7)
        self.clock_label.config(font=("Arial", self.clock_font_size, "bold"))
        self.timer_display.config(font=("Arial", timer_font_size, "bold"))
        # Do NOT update geometry here, just font

    def set_clock_window_scale(self, scale):
        self.clock_window_scale = float(scale)
        # Base: 300x200
        self.clock_width = int(200 * scale)
        self.clock_height = int(100 * scale)
        
        # Proportional Font Resizing
        # Base font (30) * scale
        new_font_size = int(30 * scale)
        self.set_clock_font_size(new_font_size)
        
        self.update_geometry()

    def set_banner_height(self, height):
        self.bar_height = height
        # Scale font size based on height (approx 50% of height)
        font_size = int(height * 0.5)
        self.label.config(font=("Arial", font_size, "bold"))
        self.update_geometry()

    def create_clock(self):
        self.clock_win = tk.Toplevel(self.root)
        self.clock_win.overrideredirect(True)
        self.clock_win.attributes("-topmost", True)
        self.clock_win.configure(bg=self.bg_color)
        
        self.clock_win.bind("<ButtonPress-1>", self.StartMove)
        self.clock_win.bind("<ButtonRelease-1>", self.StopMove)
        self.clock_win.bind("<B1-Motion>", self.OnMotion)
        
        self.clock_label = tk.Label(
            self.clock_win, 
            text="00:00:00", 
            font=("Arial", 30, "bold"), 
            bg=self.bg_color, 
            fg=self.text_color
        )
        self.clock_label.pack(padx=20, pady=(10, 0))
        
        self.timer_display = tk.Label(
            self.clock_win,
            text="",
            font=("Arial", 20, "bold"), 
            bg=self.bg_color, 
            fg="#FFFFFF"
        )
        self.timer_display.pack(padx=20, pady=(0, 10))

        self.update_clock()
        self.update_timer()

    def set_schedule_font_size(self, size):
        self.schedule_font_size = int(size)
        for lbl in self.schedule_labels:
             # Check if this label is the 'active' one (Green bg)
             is_active = (lbl.cget("bg") == "#4CAF50")
             
             if is_active:
                 lbl.config(font=("Arial", self.schedule_font_size, "bold"))
             else:
                 lbl.config(font=("Arial", self.schedule_font_size))
              
        self.update_schedule_geometry()
        
    def set_schedule_width(self, width):
        self.schedule_width = int(width)
        self.update_schedule_geometry()
        
    def update_schedule_geometry(self):
        # Force update to get height
        self.schedule_win.update_idletasks()
        req_height = self.schedule_frame.winfo_reqheight()
        # Ensure minimum height
        if req_height < 50: req_height = 50
        
        x = self.schedule_win.winfo_x()
        y = self.schedule_win.winfo_y()
        
        self.schedule_win.geometry(f"{self.schedule_width}x{req_height}+{x}+{y}")

    def create_schedule_window(self):
        self.schedule_win = tk.Toplevel(self.root)
        self.schedule_win.overrideredirect(True)
        self.schedule_win.attributes("-topmost", True)
        self.schedule_win.configure(bg="#1F1F1F") # Dark grey, distinct from banner
        
        self.schedule_win.bind("<ButtonPress-1>", self.StartMove)
        self.schedule_win.bind("<ButtonRelease-1>", self.StopMove)
        self.schedule_win.bind("<B1-Motion>", self.OnMotion_Schedule)
        
        self.schedule_frame = tk.Frame(self.schedule_win, bg="#1F1F1F")
        self.schedule_frame.pack(fill="both", expand=True, padx=5, pady=5)
        
        # Initial size/pos
        self.schedule_win.geometry("300x400+50+50")
        self.schedule_win.withdraw()
        
        self.schedule_labels = []

    def update_schedule_list(self, schedule_data):
        # Clear existing
        for widget in self.schedule_frame.winfo_children():
            widget.destroy()
        self.schedule_labels = []
        
        for i, item in enumerate(schedule_data, 1):
            lbl = tk.Label(
                self.schedule_frame, 
                text=f"{item['time']} - {item['content']}",
                font=("Arial", self.schedule_font_size),
                bg="#1F1F1F",
                fg=item['color'],
                anchor="w"
            )
            lbl.original_color = item['color'] # Store for reset
            lbl.pack(fill="x", pady=2)
            self.schedule_labels.append(lbl)
            
    def highlight_schedule_item(self, index):
        for i, lbl in enumerate(self.schedule_labels):
            if i == index:
                # Active: Green Background, White Text (High Contrast)
                lbl.config(bg="#4CAF50", fg="white", font=("Arial", self.schedule_font_size, "bold"))
            else:
                # Inactive: Dark Background, Colored Text
                lbl.config(bg="#1F1F1F", fg=lbl.original_color, font=("Arial", self.schedule_font_size))

    def get_snapping_targets(self, current_win_type):
        """Returns a list of (x, y, w, h) for other visible windows."""
        targets = []
        
        # 1. Monitor Edges (Virtual Snap Lines)
        # Snap to inner edges of the current monitor
        mx, my, mw, mh = self.monitor_x, self.monitor_y, self.monitor_width, self.monitor_height
        
        # We don't return rects for screen edges, we handle them efficiently in apply_snapping
        # just returning other windows here
        
        # Banner
        if current_win_type != "banner" and self.show_banner:
             # Banner is always at the top of its assigned position (or moved)
             # But wait, self.banner_x/y tracks it
             targets.append((self.banner_x, self.banner_y, self.monitor_width, self.bar_height))
             
        # Clock
        if current_win_type != "clock" and hasattr(self, 'clock_win') and self.clock_win.winfo_viewable():
             # Use self.clock_width/height vars which should be up to date w/ scale
             # Position: we need current position.
             # Only reliable way is to query geometry if we aren't tracking x/y consistently
             # But snapping to a moving target while moving another is rare (multi-touch?)
             # Let's use winfo_x/y
             cx = self.clock_win.winfo_x()
             cy = self.clock_win.winfo_y()
             cw = self.clock_width
             ch = self.clock_height
             targets.append((cx, cy, cw, ch))
             
        # Schedule
        if current_win_type != "schedule" and hasattr(self, 'schedule_win') and self.schedule_win.winfo_viewable():
             sx = self.schedule_win.winfo_x()
             sy = self.schedule_win.winfo_y()
             sw = self.schedule_width
             # Height is variable... getting request height
             sh = self.schedule_win.winfo_height()
             targets.append((sx, sy, sw, sh))
             
        return targets

    def apply_snapping(self, x, y, w, h, win_type):
        SNAP_DIST = 20
        
        # 1. Snap to Screen Edges
        # Screen Bounds
        min_x = self.monitor_x
        min_y = self.monitor_y
        max_x = self.monitor_x + self.monitor_width
        max_y = self.monitor_y + self.monitor_height
        
        # Left Edge
        if abs(x - min_x) < SNAP_DIST: x = min_x
        # Top Edge
        if abs(y - min_y) < SNAP_DIST: y = min_y
        # Right Edge (x + w = max_x)
        if abs((x + w) - max_x) < SNAP_DIST: x = max_x - w
        # Bottom Edge (y + h = max_y)
        if abs((y + h) - max_y) < SNAP_DIST: y = max_y - h
        
        # 2. Snap to Other Windows
        targets = self.get_snapping_targets(win_type)
        
        for tx, ty, tw, th in targets:
            # Snap X
            # My Left to Target Right
            if abs(x - (tx + tw)) < SNAP_DIST: x = tx + tw
            # My Right to Target Left
            if abs((x + w) - tx) < SNAP_DIST: x = tx - w
            # My Left to Target Left (Align Left)
            if abs(x - tx) < SNAP_DIST: x = tx
            # My Right to Target Right (Align Right)
            if abs((x + w) - (tx + tw)) < SNAP_DIST: x = tx + tw - w
            
            # Snap Y
            # My Top to Target Bottom
            if abs(y - (ty + th)) < SNAP_DIST: y = ty + th
            # My Bottom to Target Top
            if abs((y + h) - ty) < SNAP_DIST: y = ty - h
            # My Top to Target Top (Align Top)
            if abs(y - ty) < SNAP_DIST: y = ty
            # My Bottom to Target Bottom (Align Bottom)
            if abs((y + h) - (ty + th)) < SNAP_DIST: y = ty + th - h
            
        return x, y

    def OnMotion_Banner(self, event):
        if self.x is None or self.y is None: return
        deltax = event.x - self.x
        deltay = event.y - self.y
        new_x = self.root.winfo_x() + deltax
        new_y = self.root.winfo_y() + deltay
        
        # Banner properties
        w = self.monitor_width
        h = self.bar_height
        
        final_x, final_y = self.apply_snapping(new_x, new_y, w, h, "banner")
        
        self.banner_x = final_x
        self.banner_y = final_y
        self.root.geometry(f"+{final_x}+{final_y}")

    def OnMotion_Schedule(self, event):
        if self.x is None or self.y is None: return
        deltax = event.x - self.x
        deltay = event.y - self.y
        new_x = self.schedule_win.winfo_x() + deltax
        new_y = self.schedule_win.winfo_y() + deltay
        
        w = self.schedule_width
        h = self.schedule_win.winfo_height()
        
        final_x, final_y = self.apply_snapping(new_x, new_y, w, h, "schedule")
        
        self.schedule_x = final_x
        self.schedule_y = final_y
        self.schedule_win.geometry(f"+{final_x}+{final_y}")

    def StartMove(self, event):
        self.x = event.x
        self.y = event.y

    def StopMove(self, event):
        self.x = None
        self.y = None
        # Notify Control Panel to update preview
        if self.control_panel:
            self.control_panel.update_preview()

    def OnMotion(self, event):
        if self.x is None or self.y is None: return
        deltax = event.x - self.x
        deltay = event.y - self.y
        new_x = self.clock_win.winfo_x() + deltax
        new_y = self.clock_win.winfo_y() + deltay
        
        w = self.clock_width
        h = self.clock_height
        
        final_x, final_y = self.apply_snapping(new_x, new_y, w, h, "clock")
        
        self.clock_x = final_x
        self.clock_y = final_y
        self.clock_win.geometry(f"+{final_x}+{final_y}")

    def update_clock(self):
        if not self.root.winfo_exists(): return
        current_time = time.strftime("%H:%M:%S")
        self.clock_label.config(text=current_time)
        self.root.after(1000, self.update_clock)

    def start_timer(self, seconds):
        self.timer_seconds = seconds
        self.timer_running = True
        
    def stop_timer(self):
        self.timer_running = False
        self.timer_display.config(text="")

    def update_timer(self):
        if self.timer_running and self.timer_seconds > 0:
            mins, secs = divmod(self.timer_seconds, 60)
            self.timer_display.config(text=f"{mins:02d}:{secs:02d}")
            self.timer_seconds -= 1
        elif self.timer_running and self.timer_seconds <= 0:
            self.timer_display.config(text="00:00")
            self.timer_running = False
            
            # Automatically advance to next item
            if self.control_panel and hasattr(self.control_panel, 'next_item'):
                 self.control_panel.next_item()
            
        # Dynamic Color Logic
        if self.timer_running:
            if self.timer_seconds <= 30:
                # Blink Red/Off
                if self.blink_state:
                     color = "#FF0000"
                else:
                     color = "#330000" # Dim red instead of black for readability? Or just off? Let's go dim.
                self.blink_state = not self.blink_state
                
                self.timer_display.config(fg=color)
                self.label.config(fg=color)
            elif self.timer_seconds <= 60:
                # Red
                self.timer_display.config(fg="#FF0000")
                self.label.config(fg="#FF0000")
            else:
                # Green (Default)
                self.timer_display.config(fg="#00FF00")
                # Marquee Text Color - Should it be Green too? User said "fiquem verde".
                self.label.config(fg="#00FF00")
        else:
             # Reset to defaults if not running? Or keep last state?
             # Let's reset to default text color defined by item when stopped or manually?
             # But update_timer runs every second.
             # If not running, we shouldn't force colors overrides.
             pass

        self.root.after(1000 if not (self.timer_running and self.timer_seconds <= 30) else 500, self.update_timer)

    def set_clock_position(self, x, y):
        if hasattr(self, 'clock_win'):
            self.clock_win.geometry(f"+{x}+{y}")

    def scroll(self):
        if not self.scrolling: return
        self.x_pos -= 2
        text_width = self.label.winfo_reqwidth()
        if self.x_pos < -text_width:
            self.x_pos = self.monitor_width 
        self.label.place(x=self.x_pos, y=10)
        self.root.after(10, self.scroll)



class ControlPanel:
    def __init__(self, root):
        self.root = root
        self.root.title("Painel de Controle - Lagoinha Digital")
        self.root.geometry("1100x850") 
        self.root.configure(bg="#121212")

        
        # Panic Button Bind
        self.root.bind("<Escape>", self.emergency_stop)
        
        # Keyboard Navigation
        self.root.bind("<Down>", self.next_item)
        self.root.bind("<Up>", self.prev_item)

        
        self.display_root = tk.Toplevel(self.root)
        self.app = MarqueeApp(self.display_root, self)
        
        # Monitor Config
        self.monitors = []
        self.detect_monitors()
        
        # State Variables
        self.var_show_clock = tk.BooleanVar(value=False)
        self.var_show_timer = tk.BooleanVar(value=False)
        self.var_show_banner = tk.BooleanVar(value=False)
        self.var_text_mode = tk.StringVar(value="full")
        self.var_screen = tk.StringVar()
        self.var_clock_size = tk.DoubleVar(value=30)
        self.var_clock_window_scale = tk.DoubleVar(value=1.0)
        self.var_banner_height = tk.IntVar(value=80)
        self.var_show_schedule = tk.BooleanVar(value=False)
        self.var_schedule_size = tk.DoubleVar(value=12)
        self.var_schedule_width = tk.IntVar(value=300)

        
        # Weekly Schedule Initialization
        self.days_of_week = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
        
        self.presets_file = "presets.json"
        self.var_save_mode = tk.BooleanVar(value=False)
        
        # Initialize with default schedule for all days or just Monday? 
        # Plan says default for Monday, empty for others unless copied?
        # Let's put default in Monday for now.
        
        self.schedule_file = "schedule_data.json"
        
        # Load Weekly Schedule
        self.weekly_schedule = self.load_schedule()

        
        self.current_day = "Segunda"
        self.var_current_day = tk.StringVar(value=self.current_day)
        
        self.schedule = self.weekly_schedule[self.current_day]
        self.current_item = None
        self.current_item_index = None

        # --- MODES INFRASTRUCTURE ---
        self.current_mode = "PROJECTION" # or "STREAMING"
        self.mode_configs = {
            "PROJECTION": {
                "show_clock": False, "show_timer": False, "show_banner": False, "show_schedule": False,
                "clock_size": 30, "clock_scale": 1.0, "banner_height": 80, "schedule_size": 12, "schedule_width": 300,
                "text_mode": "full", "bg_color": "#CC0000" # Red default
            },
            "STREAMING": {
                "show_clock": False, "show_timer": False, "show_banner": False, "show_schedule": False,
                "clock_size": 30, "clock_scale": 1.0, "banner_height": 60, "schedule_size": 12, "schedule_width": 300,
                "text_mode": "full", "bg_color": "#00B140" # Chroma Green default
            }
        }
        
        self.setup_ui()
        # Sync Initial Schedule to App Window
        self.app.update_schedule_list(self.schedule)
        self.update_monitor()
        
        # Set default monitor selection
        if self.monitors:
            first_monitor_name = f"Monitor 0: {self.monitors[0].width}x{self.monitors[0].height}"
            self.var_screen.set(first_monitor_name)
            self.change_screen() # Apply it
            
        # Apply Default Mode (Projection)
        self.apply_mode("PROJECTION")

    def detect_monitors(self):
        try:
            self.monitors = get_monitors()
        except Exception as e:
            print(f"Error detecting monitors: {e}")
            self.monitors = []
            
        # Initial Schedule Sync
        if hasattr(self, 'schedule'):
            self.app.update_schedule_list(self.schedule)

    def load_schedule(self):
        if os.path.exists(self.schedule_file):
            try:
                with open(self.schedule_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    # Helper to ensure all days exist even if file is partial
                    for day in self.days_of_week:
                        if day not in data:
                            data[day] = []
                    return data
            except Exception as e:
                print(f"Error loading schedule: {e}")
        
        # Default Initialization if file missing or error
        default_data = {day: [] for day in self.days_of_week}
        # Populate Default for all days (or just weekdays?) - replicating original behavior
        for day in self.days_of_week:
             default_data[day] = list(DEFAULT_SCHEDULE) # Copy list to avoid ref issues
        return default_data

    def save_schedule(self):
        try:
            with open(self.schedule_file, "w", encoding="utf-8") as f:
                json.dump(self.weekly_schedule, f, indent=4, ensure_ascii=False)
        except Exception as e:
            messagebox.showerror("Erro ao Salvar", f"Não foi possível salvar o cronograma: {e}")

    def reset_schedule(self):
        if messagebox.askyesno("Confirmar", "Deseja restaurar o cronograma padrão? Isso apagará todas as suas alterações."):
             self.weekly_schedule = {day: [] for day in self.days_of_week}
             for day in self.days_of_week:
                 self.weekly_schedule[day] = list(DEFAULT_SCHEDULE)
             
             self.save_schedule()
             # Update current view
             self.schedule = self.weekly_schedule[self.current_day]
             self.refresh_schedule_list()
             self.app.update_schedule_list(self.schedule)



    def setup_ui(self):
        # 1. LEFT PANEL (Schedule) - 30% width
        # Config colors
        BG_COLOR = "#121212"
        PANEL_BG = "#1F1F1F"
        ACCENT_COLOR = "#F2C94C" # Lagoinha Yellow/Gold
        TEXT_WHITE = "#FFFFFF"
        TEXT_GRAY = "#AAAAAA"
        
        left_panel = tk.Frame(self.root, bg=PANEL_BG, width=320)
        left_panel.pack(side="left", fill="y", expand=False, padx=0, pady=0)
        
        # --- LOGO PLACEHOLDER START ---
        logo_frame = tk.Frame(left_panel, bg=PANEL_BG, height=80)
        logo_frame.pack(fill="x", pady=(20, 10), padx=20)
        logo_frame.pack_propagate(False) # Force height
        
        # Try to load a logo image if it exists, otherwise placeholder text
        # For now, just a placeholder label
        lbl_logo = tk.Label(logo_frame, text="LOGO LAGOINHA\n(Espaço Reservado)", font=("Segoe UI", 10, "bold"), bg="#333333", fg=TEXT_GRAY)
        lbl_logo.pack(fill="both", expand=True)
        # --- LOGO PLACEHOLDER END ---
        
        header_frame = tk.Frame(left_panel, bg=PANEL_BG)
        header_frame.pack(fill="x", pady=(10, 10), padx=15)
        
        lbl_list = tk.Label(header_frame, text="CRONOGRAMA", font=("Segoe UI", 14, "bold"), bg=PANEL_BG, fg=ACCENT_COLOR)
        lbl_list.pack(side="left")
        
        btn_reset = tk.Button(header_frame, text="↺", bg="#333333", fg="white", font=("Segoe UI", 12), relief="flat", command=self.reset_schedule, width=3)
        btn_reset.pack(side="right", padx=5)

        btn_add = tk.Button(header_frame, text="+", bg=ACCENT_COLOR, fg="black", font=("Segoe UI", 12, "bold"), relief="flat", command=lambda: self.open_editor(None), width=3)
        btn_add.pack(side="right")
        
        # --- MODE SWITCHER (Top of Panel) ---
        mode_frame = tk.Frame(left_panel, bg=PANEL_BG)
        mode_frame.pack(fill="x", pady=(5, 5), padx=15)
        
        self.btn_mode_proj = tk.Button(mode_frame, text="PROJEÇÃO", font=("Segoe UI", 9, "bold"), relief="flat", width=12, command=lambda: self.switch_mode("PROJECTION"))
        self.btn_mode_proj.pack(side="left", padx=2)
        
        self.btn_mode_stream = tk.Button(mode_frame, text="STREAMING", font=("Segoe UI", 9, "bold"), relief="flat", width=12, command=lambda: self.switch_mode("STREAMING"))
        self.btn_mode_stream.pack(side="left", padx=2)
        # ------------------------------------
        
        # Day Selector Buttons
        day_frame = tk.Frame(left_panel, bg=PANEL_BG)
        day_frame.pack(fill="x", pady=(0, 15), padx=5)
        
        self.day_buttons = {}
        day_mapping = {
            "SEG": "Segunda", "TER": "Terça", "QUA": "Quarta", 
            "QUI": "Quinta", "SEX": "Sexta", "SAB": "Sábado", "DOM": "Domingo"
        }
        
        for code, full_name in day_mapping.items():
            btn = tk.Button(
                day_frame, 
                text=code, 
                font=("Segoe UI", 8, "bold"),
                width=4,
                bg="#333333", 
                fg="white", 
                relief="flat",
                command=lambda d=full_name: self.change_day(d)
            )
            btn.pack(side="left", padx=2)
            self.day_buttons[full_name] = btn
            
        # Highlight initial day
        self.update_day_buttons_style()

        canvas = tk.Canvas(left_panel, bg=PANEL_BG, highlightthickness=0)
        scrollbar = tk.Scrollbar(left_panel, orient="vertical", command=canvas.yview)
        self.scrollable_frame = tk.Frame(canvas, bg=PANEL_BG)
        
        self.scrollable_frame.bind("<Configure>", lambda e: canvas.configure(scrollregion=canvas.bbox("all")))
        canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw", width=300)
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side="left", fill="both", expand=True, padx=(10,0))
        scrollbar.pack(side="right", fill="y")
        
        self.refresh_schedule_list()
        
        # 2. MIDDLE PANEL (Preview) - Expanded
        middle_panel = tk.Frame(self.root, bg=BG_COLOR)
        middle_panel.pack(side="left", fill="both", expand=True, padx=20, pady=20)

        
        # --- PRESETS UI START ---
        presets_frame = tk.Frame(middle_panel, bg=BG_COLOR)
        presets_frame.pack(fill="x", pady=(0, 20))
        
        tk.Label(presets_frame, text="PRESETS", font=("Segoe UI", 10, "bold"), bg=BG_COLOR, fg=TEXT_GRAY).pack(anchor="w", pady=(0, 5))

        pf_btn_frame = tk.Frame(presets_frame, bg=BG_COLOR)
        pf_btn_frame.pack(fill="x", anchor="w")
        
        # 3 Slots
        for i in range(1, 4):
            btn = tk.Button(pf_btn_frame, text=f"SLOT {i}", font=("Segoe UI", 9, "bold"), bg=PANEL_BG, fg="white", 
                            command=lambda slot=i: self.handle_preset(slot), width=10, relief="flat", activebackground=ACCENT_COLOR, activeforeground="black")
            btn.pack(side="left", padx=(0, 10))
            
        # Save Mode Toggle
        self.chk_save_mode = tk.Checkbutton(pf_btn_frame, text="MODO SALVAR (Sobrescrever)", variable=self.var_save_mode, 
                                            bg=BG_COLOR, fg=ACCENT_COLOR, selectcolor="#222222", font=("Segoe UI", 9), command=self.update_save_mode_ui)
        self.chk_save_mode.pack(side="left", padx=20)
        # --- PRESETS UI END ---
        
        # Preview Header
        tk.Label(middle_panel, text="PRÉ-VISUALIZAÇÃO EM TEMPO REAL", font=("Segoe UI", 10, "bold"), bg=BG_COLOR, fg=TEXT_GRAY).pack(anchor="center", pady=(10, 5))
        
        # Canvas Wrapper to center it with a border
        canvas_border = tk.Frame(middle_panel, bg="#333333", padx=2, pady=2)
        canvas_border.pack(expand=True, fill="both")
        
        canvas_wrapper = tk.Frame(canvas_border, bg="black")
        canvas_wrapper.pack(expand=True, fill="both")
        
        self.preview_canvas = tk.Canvas(canvas_wrapper, bg="#000000", highlightthickness=0)
        self.preview_canvas.place(relx=0.5, rely=0.5, anchor="center")
        
        self.current_preview_text = "AGUARDANDO..."
        self.current_preview_color = "white"
        
        # Start Animation Loop
        self.animate_preview()
        
        # Canvas Events
        self.preview_canvas.tag_bind("clock", "<ButtonPress-1>", self.on_preview_press)
        self.preview_canvas.tag_bind("clock", "<B1-Motion>", self.on_preview_drag)
        self.preview_canvas.tag_bind("clock", "<ButtonRelease-1>", self.on_preview_release)
        
        self.preview_canvas.tag_bind("banner", "<ButtonPress-1>", self.on_preview_press)
        self.preview_canvas.tag_bind("banner", "<B1-Motion>", self.on_preview_drag)
        self.preview_canvas.tag_bind("banner", "<ButtonRelease-1>", self.on_preview_release)
        
        self.preview_canvas.tag_bind("schedule", "<ButtonPress-1>", self.on_preview_press)
        self.preview_canvas.tag_bind("schedule", "<B1-Motion>", self.on_preview_drag)
        self.preview_canvas.tag_bind("schedule", "<ButtonRelease-1>", self.on_preview_release)
        
        self.drag_data = {"x": 0, "y": 0}

        # Tips in Middle Panel Bottom
        tips_text = (
            "Arraste os elementos (Relógio, Letreiro) dentro da área preta para posicioná-los nas telas."
        )
        tk.Label(middle_panel, text=tips_text, font=("Segoe UI", 9), bg=BG_COLOR, fg="#666666").pack(side="bottom", pady=10)

        # 3. RIGHT PANEL (Controls)
        right_panel = tk.Frame(self.root, bg=PANEL_BG, width=300)
        right_panel.pack(side="right", fill="y", expand=False, padx=0, pady=0)
        
        # Header Current Item
        current_frame = tk.Frame(right_panel, bg=PANEL_BG, pady=20, padx=20)
        current_frame.pack(fill="x")
        
        tk.Label(current_frame, text="ITEM ATUAL", font=("Segoe UI", 10, "bold"), bg=PANEL_BG, fg=ACCENT_COLOR).pack(anchor="w")
        self.lbl_active_idx = tk.Label(current_frame, text="--", font=("Segoe UI", 28, "bold"), bg=PANEL_BG, fg="white")
        self.lbl_active_idx.pack(anchor="w")
        
        self.lbl_active_name = tk.Label(current_frame, text="Nenhum item selecionado", font=("Segoe UI", 11), bg=PANEL_BG, fg=TEXT_GRAY, wraplength=260, justify="left")
        self.lbl_active_name.pack(anchor="w", pady=(5,0))

        # Timer Big
        timer_frame = tk.Frame(right_panel, bg="#111111", pady=10)
        timer_frame.pack(fill="x", padx=10, pady=10)
        self.lbl_timer = tk.Label(timer_frame, text="--:--", font=("Segoe UI", 40, "bold"), bg="#111111", fg="#00E676")
        self.lbl_timer.pack()

        # Controls Group (Checkboxes)
        controls_Label = tk.Label(right_panel, text="EXIBIÇÃO", font=("Segoe UI", 10, "bold"), bg=PANEL_BG, fg="white")
        controls_Label.pack(anchor="w", padx=20, pady=(10,5))

        chk_style = {"bg": PANEL_BG, "fg": TEXT_WHITE, "selectcolor": "#444444", "activebackground": PANEL_BG, "activeforeground": "white", "font": ("Segoe UI", 10)}
        
        self.chk_clock = tk.Checkbutton(right_panel, text="Relógio", variable=self.var_show_clock, command=self.refresh_display, **chk_style)
        self.chk_clock.pack(anchor="w", padx=20)
        
        self.chk_timer = tk.Checkbutton(right_panel, text="Cronômetro", variable=self.var_show_timer, command=self.refresh_display, **chk_style)
        self.chk_timer.pack(anchor="w", padx=20)
        
        self.chk_banner = tk.Checkbutton(right_panel, text="Letreiro (Banner)", variable=self.var_show_banner, command=self.refresh_display, **chk_style)
        self.chk_banner.pack(anchor="w", padx=20)
        
        self.chk_schedule = tk.Checkbutton(right_panel, text="Janela Cronograma", variable=self.var_show_schedule, command=self.refresh_display, **chk_style)
        self.chk_schedule.pack(anchor="w", padx=20)
        
        # Settings Group (Scrollable or Compact)
        settings_frame = tk.Frame(right_panel, bg=PANEL_BG, padx=20, pady=10)
        settings_frame.pack(fill="x", expand=True) 
        
        tk.Label(settings_frame, text="CONFIGURAÇÕES RÁPIDAS", font=("Segoe UI", 10, "bold"), bg=PANEL_BG, fg="white").pack(anchor="w", pady=(0, 15))
        
        # --- MONITOR ---
        mon_frame = tk.LabelFrame(settings_frame, text="Monitor", bg=PANEL_BG, fg=ACCENT_COLOR, font=("Segoe UI", 9, "bold"), padx=5, pady=5)
        mon_frame.pack(fill="x", pady=(0, 10))
        
        monitor_options = [f"Monitor {i}: {m.width}x{m.height}" for i, m in enumerate(self.monitors)]
        if not monitor_options: monitor_options = ["Nenhum Monitor Detectado"]
        self.screen_combo = ttk.Combobox(mon_frame, textvariable=self.var_screen, values=monitor_options, state="readonly")
        self.screen_combo.pack(fill="x")
        self.screen_combo.bind("<<ComboboxSelected>>", self.change_screen)
        
        # Helper for aligned sliders
        def create_slider(parent, label_text, var, from_, to_, cmd, res=1):
            f = tk.Frame(parent, bg=PANEL_BG)
            f.pack(fill="x", pady=2)
            tk.Label(f, text=label_text, bg=PANEL_BG, fg=TEXT_GRAY, font=("Segoe UI", 9), width=15, anchor="w").pack(side="left")
            s = tk.Scale(f, from_=from_, to=to_, orient="horizontal", variable=var, bg=PANEL_BG, fg="white", highlightthickness=0, command=cmd, showvalue=0, resolution=res)
            s.pack(side="right", fill="x", expand=True, padx=(5,0))
            return s

        # --- CLOCK & BANNER ---
        cb_frame = tk.LabelFrame(settings_frame, text="Relógio / Letreiro", bg=PANEL_BG, fg=ACCENT_COLOR, font=("Segoe UI", 9, "bold"), padx=5, pady=5)
        cb_frame.pack(fill="x", pady=(0, 10))
        
        create_slider(cb_frame, "Tam. Relógio:", self.var_clock_size, 20, 200, self.change_clock_font_size)
        create_slider(cb_frame, "Fundo Relógio:", self.var_clock_window_scale, 0.5, 3.0, self.change_clock_window_scale, 0.1)
        create_slider(cb_frame, "Alt. Letreiro:", self.var_banner_height, 50, 300, self.change_banner_height)

        # --- SCHEDULE ---
        sch_frame = tk.LabelFrame(settings_frame, text="Cronograma", bg=PANEL_BG, fg=ACCENT_COLOR, font=("Segoe UI", 9, "bold"), padx=5, pady=5)
        sch_frame.pack(fill="x", pady=(0, 0))
        
        create_slider(sch_frame, "Tam. Fonte:", self.var_schedule_size, 8, 40, self.change_schedule_size)
        create_slider(sch_frame, "Largura Janela:", self.var_schedule_width, 200, 1000, self.change_schedule_width)
        
        tk.Label(sch_frame, text="Modo Texto:", bg=PANEL_BG, fg=TEXT_GRAY, font=("Segoe UI", 9), width=15, anchor="w").pack(anchor="w", pady=(5, 0))
        text_f = tk.Frame(sch_frame, bg=PANEL_BG)
        text_f.pack(fill="x", pady=(0, 5))
        tk.Radiobutton(text_f, text="Completo", variable=self.var_text_mode, value="full", bg=PANEL_BG, fg="white", selectcolor="#444444", activebackground=PANEL_BG, activeforeground="white").pack(side="left")
        tk.Radiobutton(text_f, text="Simples", variable=self.var_text_mode, value="simple", bg=PANEL_BG, fg="white", selectcolor="#444444", activebackground=PANEL_BG, activeforeground="white").pack(side="left", padx=10)

        exit_btn = tk.Button(right_panel, text="ENCERRAR APLICAÇÃO", bg="#D32F2F", fg="white", font=("Segoe UI", 10, "bold"), relief="flat", padx=20, pady=15, command=self.quit_app)
        exit_btn.pack(side="bottom", fill="x")
        
        self.context_menu = tk.Menu(self.root, tearoff=0)
        self.context_menu.add_command(label="Editar Item", command=self.edit_choice)
        self.context_menu.add_command(label="Remover Item", command=self.delete_item)
        self.context_item_index = None

        
    def update_preview(self):
        if not self.monitors: return
        selection_idx = self.screen_combo.current()
        
        # 1. Calculate Virtual Desktop Bounds
        min_x = min(m.x for m in self.monitors)
        min_y = min(m.y for m in self.monitors)
        max_x = max(m.x + m.width for m in self.monitors)
        max_y = max(m.y + m.height for m in self.monitors)
        
        total_w = max_x - min_x
        total_h = max_y - min_y
        
        # 2. Calculate Scale to fit in (Larger now: 600x400)
        max_preview_w = 600 
        max_preview_h = 400 
        
        scale_w = max_preview_w / total_w
        scale_h = max_preview_h / total_h
        scale = min(scale_w, scale_h) # Fit both
        
        self.scale_factor = scale
        self.preview_offset_x = min_x
        self.preview_offset_y = min_y
        
        canvas_w = int(total_w * scale)
        canvas_h = int(total_h * scale)
        
        self.preview_canvas.config(width=canvas_w+20, height=canvas_h+20) # Add padding
        self.preview_canvas.delete("all")
        
        # 3. Draw Monitors
        for i, m in enumerate(self.monitors):
            mx = (m.x - min_x) * scale + 10 # +10 padding
            my = (m.y - min_y) * scale + 10
            mw = m.width * scale
            mh = m.height * scale
            
            if i == selection_idx:
                 fill_col = "#2A2A2A"
                 outline_col = "#00E676" # Green highlight
                 width = 2
            else:
                 fill_col = "#111111"
                 outline_col = "#444444"
                 width = 1
                 
            self.preview_canvas.create_rectangle(mx, my, mx+mw, my+mh, fill=fill_col, outline=outline_col, width=width, tags="monitor")
            self.preview_canvas.create_text(mx + mw/2, my + mh/2, text=f"{i}", fill="#555555", font=("Segoe UI", 20, "bold"))

        # 4. Draw Elements (Banner & Clock & Schedule) using Absolute Coords
        
        # --- BANNER ---
        if self.var_show_banner.get():
             real_bx = self.app.banner_x
             real_by = self.app.banner_y
             real_bw = self.app.monitor_width 
             real_bh = self.var_banner_height.get()
             
             bx = (real_bx - min_x) * scale + 10
             by = (real_by - min_y) * scale + 10
             bw = real_bw * scale
             bh = real_bh * scale
             
             self.banner_item = self.preview_canvas.create_rectangle(bx, by, bx+bw, by+bh, fill="black", outline="red", width=1, tags="banner")
             
             if not hasattr(self, 'current_preview_text'):
                 self.current_preview_text = "LETREIRO DIGITAL"
                 
             font_size = max(8, int(20 * scale))
             
             text_start_x = bx + bw 
             text_y = by + bh/2
             
             self.preview_text_id = self.preview_canvas.create_text(text_start_x, text_y, text=self.current_preview_text, fill=self.current_preview_color, font=("Arial", font_size, "bold"), anchor="w", tags="banner")
             
             self.preview_banner_left_x = bx
             self.preview_banner_width = bw
             self.preview_text_rel_x = bw 

        # --- CLOCK ---
        if self.var_show_clock.get() or self.var_show_timer.get():
             try:
                 if hasattr(self.app, 'clock_win'):
                     real_cx = self.app.clock_win.winfo_x()
                     real_cy = self.app.clock_win.winfo_y()
                 else:
                     raise Exception("No window")
                 real_cw = self.app.clock_width
                 real_ch = self.app.clock_height
             except:
                 real_cw = self.app.clock_width
                 real_ch = self.app.clock_height
                 if selection_idx != -1:
                      sel_mon = self.monitors[selection_idx]
                      real_cx = sel_mon.x + sel_mon.width - real_cw - 20
                      real_cy = sel_mon.y + sel_mon.height - real_ch - 20
                 else:
                      real_cx = 0
                      real_cy = 0
             
             cx = (real_cx - min_x) * scale + 10
             cy = (real_cy - min_y) * scale + 10
             cw = real_cw * scale
             ch = real_ch * scale
             
             self.clock_item = self.preview_canvas.create_rectangle(cx, cy, cx+cw, cy+ch, fill="#222222", outline="green", width=2, tags="clock")
             
             font_size = max(8, int(20 * scale))
             self.preview_clock_id = self.preview_canvas.create_text(cx+cw/2, cy+ch/2, text="--:--", fill="white", font=("Arial", font_size, "bold"), tags="clock")

        # --- SCHEDULE ---
        if self.var_show_schedule.get():
             try:
                 if hasattr(self.app, 'schedule_win'):
                     real_sx = self.app.schedule_win.winfo_x()
                     real_sy = self.app.schedule_win.winfo_y()
                     real_sh = self.app.schedule_win.winfo_height()
                 else:
                     raise Exception
                 real_sw = self.app.schedule_width
             except:
                 real_sw = self.app.schedule_width
                 real_sh = 300 # Approx
                 if selection_idx != -1:
                      sel_mon = self.monitors[selection_idx]
                      real_sx = sel_mon.x + 50
                      real_sy = sel_mon.y + 150
                 else:
                      real_sx = 50
                      real_sy = 150
             
             sx = (real_sx - min_x) * scale + 10
             sy = (real_sy - min_y) * scale + 10
             sw = real_sw * scale
             sh = real_sh * scale
             
             # Dentro de update_preview:
             self.schedule_item = self.preview_canvas.create_rectangle(
                 sx, sy, sx+sw, sy+sh, 
                 fill="#1A1A1A", 
                 outline="orange", 
                 tags="schedule"
             )
             
             font_size = max(6, int(12 * scale))
             self.preview_schedule_id = self.preview_canvas.create_text(sx+sw/2, sy+20*scale, text="CRONOGRAMA", fill="orange", font=("Arial", font_size, "bold"), tags="schedule")
             
    def animate_preview(self):
        if hasattr(self, 'preview_text_id') and hasattr(self, 'preview_clock_id'):
            # 1. Update Clock Time
            current_time = time.strftime("%H:%M:%S")
            self.preview_canvas.itemconfig(self.preview_clock_id, text=current_time)
            
            # 2. Scroll Text
            if self.var_show_banner.get() and hasattr(self, 'preview_text_rel_x'):
                self.preview_text_rel_x -= 1 # Move left
                
                # Check absolute position vs banner width
                # Text X = Banner Left + Rel X
                # Text width?
                bbox = self.preview_canvas.bbox(self.preview_text_id)
                if bbox:
                    text_w = bbox[2] - bbox[0]
                    # If text has fully scrolled out to the left (Right edge < Banner Left)
                    if bbox[2] < self.preview_banner_left_x:
                         self.preview_text_rel_x = self.preview_banner_width
                
                new_x = self.preview_banner_left_x + self.preview_text_rel_x
                coords = self.preview_canvas.coords(self.preview_text_id)
                if coords:
                    self.preview_canvas.coords(self.preview_text_id, new_x, coords[1])
        
        self.root.after(30, self.animate_preview)


    def on_preview_press(self, event):
        self.drag_data["x"] = event.x
        self.drag_data["y"] = event.y
        # Identificar item sob cursor
        # Use find_overlapping to see what's actually under the mouse
        items = self.preview_canvas.find_overlapping(event.x, event.y, event.x+1, event.y+1)
        
        item = None
        if items:
            item = items[-1] # Top-most item
        
        self.drag_data["item"] = item

    def on_preview_drag(self, event):
        if not "item" in self.drag_data: return
        dx = event.x - self.drag_data["x"]
        dy = event.y - self.drag_data["y"]
        
        item = self.drag_data["item"]
        tags = self.preview_canvas.gettags(item)
        
        target_tag = None
        if "clock" in tags: target_tag = "clock"
        elif "banner" in tags: target_tag = "banner"
        elif "schedule" in tags: target_tag = "schedule"
        
        if target_tag:
             self.preview_canvas.move(target_tag, dx, dy)
             
             # Live Sync
             if hasattr(self, 'scale_factor'):
                 # Use reference rectangle for coordinates to ensure accuracy 
                 ref_item = None
                 if target_tag == "clock": ref_item = self.clock_item
                 elif target_tag == "banner": ref_item = self.banner_item
                 elif target_tag == "schedule": ref_item = self.schedule_item
                 
                 if ref_item:
                     coords = self.preview_canvas.coords(ref_item)
                     if coords:
                         # Calculate Real Coords
                         real_x = int((coords[0] - 10) / self.scale_factor + self.preview_offset_x)
                         real_y = int((coords[1] - 10) / self.scale_factor + self.preview_offset_y)
                         
                         if target_tag == "clock":
                              w = self.app.clock_width
                              h = self.app.clock_height
                              final_x, final_y = self.app.apply_snapping(real_x, real_y, w, h, "clock")
                              self.app.clock_win.geometry(f"+{int(final_x)}+{int(final_y)}")
                              
                         elif target_tag == "banner":
                              w = self.app.monitor_width
                              h = self.app.bar_height
                              final_x, final_y = self.app.apply_snapping(real_x, real_y, w, h, "banner")
                              self.app.banner_x = final_x
                              self.app.banner_y = final_y
                              self.app.root.geometry(f"+{int(final_x)}+{int(final_y)}")
                              
                         elif target_tag == "schedule":
                              w = self.app.schedule_width
                              h = self.app.schedule_win.winfo_height()
                              final_x, final_y = self.app.apply_snapping(real_x, real_y, w, h, "schedule")
                              self.app.schedule_win.geometry(f"+{int(final_x)}+{int(final_y)}")
             
        self.drag_data["x"] = event.x
        self.drag_data["y"] = event.y

        




    def on_preview_release(self, event):
        item = self.drag_data.get("item")
        if not item: return
        tags = self.preview_canvas.gettags(item)
        
        # Need Min X/Y and Scale to calculate back to absolute
        if not hasattr(self, 'scale_factor'): return
        
        if "clock" in tags:
            coords = self.preview_canvas.coords(self.clock_item) # Rectangle coords (Canvas System)
            if not coords: return
             
            real_x = int((coords[0] - 10) / self.scale_factor + self.preview_offset_x)
            real_y = int((coords[1] - 10) / self.scale_factor + self.preview_offset_y)
             
            # Use snapping here too? The user asked for "control inside preview".
            # Ideally YES, dragging in preview should also snap.
            # But apply_snapping is in app, we can call it.
            
            # Since apply_snapping updates geometry, let's just create a wrapper in app or call it directly.
            # Wait, apply_snapping takes x,y,w,h.
            
            w = self.app.clock_width
            h = self.app.clock_height
            final_x, final_y = self.app.apply_snapping(real_x, real_y, w, h, "clock")
            
            self.app.clock_win.geometry(f"+{final_x}+{final_y}")
            
        elif "banner" in tags:
            coords = self.preview_canvas.coords(self.banner_item)
            if not coords: return
             
            real_x = int((coords[0] - 10) / self.scale_factor + self.preview_offset_x)
            real_y = int((coords[1] - 10) / self.scale_factor + self.preview_offset_y)
            
            w = self.app.monitor_width
            h = self.app.bar_height
            final_x, final_y = self.app.apply_snapping(real_x, real_y, w, h, "banner")
            
            self.app.banner_x = final_x
            self.app.banner_y = final_y
            self.app.root.geometry(f"+{final_x}+{final_y}")
            
        elif "schedule" in tags:
            coords = self.preview_canvas.coords(self.schedule_item)
            if not coords: return
             
            real_x = int((coords[0] - 10) / self.scale_factor + self.preview_offset_x)
            real_y = int((coords[1] - 10) / self.scale_factor + self.preview_offset_y)
            
            w = self.app.schedule_width
            h = self.app.schedule_win.winfo_height()
            final_x, final_y = self.app.apply_snapping(real_x, real_y, w, h, "schedule")
            
            self.app.schedule_win.geometry(f"+{final_x}+{final_y}")
            
        self.drag_data["item"] = None
        self.update_preview() # Redraw to sync perfectly

    def refresh_schedule_list(self):
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()
        for i, item in enumerate(self.schedule, 1):
            schedule_text = f"{i}. {item['content']}"
            btn_frame = tk.Frame(self.scrollable_frame, bg="#1F1F1F", pady=2)
            btn_frame.pack(fill="x")
            btn = tk.Button(
                btn_frame, 
                text=schedule_text, 
                anchor="w",
                font=("Arial", 11),
                bg=item['color'],
                fg="black",
                relief="flat",
                padx=10,
                pady=5,
                cursor="hand2",
                command=lambda item=item, idx=i: self.select_option(item, idx)
            )
            btn.pack(fill="x", padx=2)
            btn.bind("<Button-3>", lambda event, idx=i-1: self.show_context_menu(event, idx))
            btn.bind("<Double-Button-1>", lambda event, idx=i-1: self.open_editor(idx))

    def show_context_menu(self, event, index):
        self.context_item_index = index
        self.context_menu.tk_popup(event.x_root, event.y_root)

    def edit_choice(self):
        if self.context_item_index is not None:
            self.open_editor(self.context_item_index)
            self.context_item_index = None

    def delete_item(self):
        if self.context_item_index is not None:
            del self.schedule[self.context_item_index]
            self.save_schedule() # Save change
            self.refresh_schedule_list()
            self.context_item_index = None

    def open_editor(self, index=None):
        add_win = tk.Toplevel(self.root)
        mode = "Editar" if index is not None else "Adicionar"
        add_win.title(f"{mode} Item")
        add_win.geometry("400x450")
        add_win.configure(bg="#333333")
        
        lbl_style = {"bg": "#333333", "fg": "white", "font": ("Arial", 10)}
        entry_style = {"font": ("Arial", 10)}
        
        data = {}
        if index is not None:
            data = self.schedule[index]
        
        tk.Label(add_win, text="Título / Conteúdo:", **lbl_style).pack(anchor="w", padx=20, pady=(20, 5))
        e_content = tk.Entry(add_win, **entry_style)
        e_content.pack(fill="x", padx=20)
        e_content.focus()
        if index is not None: e_content.insert(0, data.get('content', ''))
        
        tk.Label(add_win, text="Horário (ex: 19:00 as 19:30):", **lbl_style).pack(anchor="w", padx=20, pady=(10, 5))
        e_time = tk.Entry(add_win, **entry_style)
        e_time.pack(fill="x", padx=20)
        e_time.insert(0, data.get('time', '00:00'))
        
        tk.Label(add_win, text="Duração (ex: 5min):", **lbl_style).pack(anchor="w", padx=20, pady=(10, 5))
        e_duration = tk.Entry(add_win, **entry_style)
        e_duration.pack(fill="x", padx=20)
        e_duration.insert(0, data.get('duration', '5min'))
        
        tk.Label(add_win, text="Líder / Responsável:", **lbl_style).pack(anchor="w", padx=20, pady=(10, 5))
        e_lead = tk.Entry(add_win, **entry_style)
        e_lead.pack(fill="x", padx=20)
        if index is not None: e_lead.insert(0, data.get('lead', ''))
        
        tk.Label(add_win, text="Cor do Botão:", **lbl_style).pack(anchor="w", padx=20, pady=(10, 5))
        
        colors = {
            "Amarelo": "#FFEB3B", 
            "Laranja": "#FF8C00", 
            "Verde": "#90EE90", 
            "Azul": "#4682B4", 
            "Vermelho": "#FF0000",
            "Cinza": "#808080"
        }
        # Reverse map for finding color name from hex
        hex_to_name = {v: k for k, v in colors.items()}
        
        c_color = ttk.Combobox(add_win, values=list(colors.keys()), state="readonly")
        c_color.pack(fill="x", padx=20)
        
        default_color = data.get('color', '#FFEB3B')
        color_name = hex_to_name.get(default_color, "Amarelo")
        c_color.set(color_name)
        
        def save():
            if not e_content.get():
                messagebox.showerror("Erro", "O campo Conteúdo é obrigatório.")
                return
            new_item = {
                "time": e_time.get(),
                "sigla": "ITEM",
                "content": e_content.get(),
                "duration": e_duration.get(),
                "lead": e_lead.get(),
                "color": colors[c_color.get()]
            }
            
            if index is not None:
                self.schedule[index] = new_item
            else:
                self.schedule.append(new_item)
            
            self.save_schedule() # Save change  
            self.refresh_schedule_list()
            add_win.destroy()
            
        btn_text = "SALVAR ALTERAÇÕES" if index is not None else "ADICIONAR"
        tk.Button(add_win, text=btn_text, bg="#4CAF50", fg="white", font=("Arial", 11, "bold"), command=save).pack(fill="x", padx=20, pady=30)


    def change_screen(self, event=None):
        selection_idx = self.screen_combo.current()
        if selection_idx == -1 or not self.monitors:
            return
            
        selected_monitor = self.monitors[selection_idx]
        
        # Pass x, y, width, height to the marquee app
        self.app.set_monitor_config(
            selected_monitor.x, 
            selected_monitor.y, 
            selected_monitor.width, 
            selected_monitor.height
        )
        self.update_preview()
            
    def change_clock_font_size(self, value):
        self.app.set_clock_font_size(float(value))
        self.update_preview()

    def change_clock_window_scale(self, value):
        self.app.set_clock_window_scale(float(value))
        self.update_preview()

    def change_banner_height(self, value):
        self.app.set_banner_height(int(value))
        self.update_preview()
        
    def change_schedule_size(self, value):
        self.app.set_schedule_font_size(float(value))
        self.update_preview()

    def change_schedule_width(self, value):
        self.app.set_schedule_width(int(value))
        self.update_preview()
        
    def emergency_stop(self, event=None):
        """Immediately hides all displays and stops activity."""
        self.var_show_banner.set(False)
        self.var_show_clock.set(False)
        self.var_show_timer.set(False)
        
        # Stop timer
        self.app.stop_timer()
        
        # Update display (Will hide everything because vars are False)
        self.refresh_display()

    def change_day(self, new_day):
        # Handle event arg if coming from bind (compat, though we removed bind)
        # Using lambda in buttons passes string directly
        if hasattr(new_day, 'widget'): 
             # Safety fallback
             return

        if new_day in self.weekly_schedule:
            self.current_day = new_day
            self.var_current_day.set(new_day) # Keep var synced if needed
            self.schedule = self.weekly_schedule[self.current_day]
            self.refresh_schedule_list()
            self.current_context_item = None
            
            # Sync Floating Window
            self.app.update_schedule_list(self.schedule)
            
            self.update_day_buttons_style()

    def update_day_buttons_style(self):
        for day_name, btn in self.day_buttons.items():
            if day_name == self.current_day:
                btn.config(bg="#4CAF50", fg="white") # Active: Green
            else:
                btn.config(bg="#3E3E3E", fg="white") # Inactive: Dark Grey

    def parse_duration(self, duration_str):
        if not duration_str or duration_str == "-------":
            return None
        try:
            mins = int(duration_str.lower().replace("min", "").strip())
            return mins * 60
        except ValueError:
            return None



    def select_option(self, item, index):
        self.current_item = item
        self.current_item_index = index - 1
        self.lbl_active_idx.config(text=f"OPÇÃO {index}", fg=item['color'])
        self.lbl_active_name.config(text=item['content'])
        
        # Update Preview State
        self.current_preview_text = item['content']
        self.current_preview_color = item['color']
        
        if not self.var_show_banner.get():
            self.var_show_banner.set(True)
        if not self.var_show_timer.get() and not self.var_show_clock.get():
             self.var_show_clock.set(True)
             self.var_show_timer.set(True)
             
        if self.var_text_mode.get() == "full":
             display_text = f"{item['time']} - {item['content']} ({item['lead']})"
        else:
             display_text = item['content']

        self.app.update_text(
            display_text, 
            item['color'], 
            self.var_show_banner.get(), 
            self.var_show_clock.get(),
            self.var_show_timer.get(),
            self.var_show_schedule.get(),
            self.var_text_mode.get()
        )
        # Highlight in floating window
        self.app.highlight_schedule_item(index-1)
        
        # Start Timer
        duration_str = item.get('duration', '-------')
        seconds = self.parse_duration(duration_str)
        self.app.start_countdown(seconds)
        
        self.update_preview()

    def next_item(self, event=None):
        if self.current_item_index is None:
            # If nothing selected, maybe select first?
            if self.schedule:
                self.select_option(self.schedule[0], 1)
            return
            
        next_idx = self.current_item_index + 1
        if next_idx < len(self.schedule):
            next_item = self.schedule[next_idx]
            # select_option takes 1-based index for label
            self.select_option(next_item, next_idx + 1)
        else:
            # End of schedule
            pass

    def prev_item(self, event=None):
        if self.current_item_index is None:
            return
            
        prev_idx = self.current_item_index - 1
        if prev_idx >= 0:
            prev_item = self.schedule[prev_idx]
            self.select_option(prev_item, prev_idx + 1)


    def refresh_display(self, start_timer=False):
        # Update text format based on selection
        if hasattr(self, 'current_item') and self.current_item:
             if self.var_text_mode.get() == "full":
                 display_text = f"{self.current_item['time']} - {self.current_item['content']} ({self.current_item['lead']})"
             else:
                 display_text = self.current_item['content']
                 
             self.app.update_text(
                display_text, 
                self.current_item['color'], 
                self.var_show_banner.get(), 
                self.var_show_clock.get(),
                self.var_show_timer.get(),
                self.var_show_schedule.get(),
                self.var_text_mode.get()
            )
             self.update_preview()

    def update_monitor(self):
        if hasattr(self, 'app') and self.app.timer_running:
            mins, secs = divmod(self.app.timer_seconds, 60)
            self.lbl_timer.config(text=f"{mins:02d}:{secs:02d}", fg="#00FF00")
        else:
             self.lbl_timer.config(text="--:--", fg="#555555")
        self.root.after(500, self.update_monitor)

    def update_save_mode_ui(self):
        # Update colors based on save mode
        if self.var_save_mode.get():
             self.chk_save_mode.configure(fg="red", text="MODO SALVAR (ATIVO)")
        else:
             self.chk_save_mode.configure(fg="#F2C94C", text="MODO SALVAR (Sobrescrever)")

    def handle_preset(self, slot_id):
        if self.var_save_mode.get():
            self.save_preset(slot_id)
        else:
            self.load_preset(slot_id)
            
    def save_preset(self, slot_id):
        data = {
            "clock_size": self.var_clock_size.get(),
            "clock_scale": self.var_clock_window_scale.get(),
            "banner_height": self.var_banner_height.get(),
            "schedule_size": self.var_schedule_size.get(),
            "schedule_width": self.var_schedule_width.get(),
            # Could save text_mode or pos too, but let's start with visual sizes
        }
        
        all_presets = {}
        if os.path.exists(self.presets_file):
            try:
                with open(self.presets_file, 'r') as f:
                    all_presets = json.load(f)
            except:
                all_presets = {}
        
        all_presets[str(slot_id)] = data
        
        with open(self.presets_file, 'w') as f:
            json.dump(all_presets, f)
            
        messagebox.showinfo("Salvo", f"Configurações salvas no Slot {slot_id}!")
        self.var_save_mode.set(False) # Auto turn off save mode
        self.update_save_mode_ui()

    def load_preset(self, slot_id):
        if not os.path.exists(self.presets_file):
            messagebox.showwarning("Erro", "Nenhum preset salvo ainda.")
            return
            
        try:
            with open(self.presets_file, 'r') as f:
                all_presets = json.load(f)
        except:
            return
            
        data = all_presets.get(str(slot_id))
        if not data:
            messagebox.showwarning("Vazio", f"O Slot {slot_id} está vazio.")
            return
            
        # Apply
        if "clock_size" in data: 
            self.var_clock_size.set(data["clock_size"])
            self.change_clock_font_size(data["clock_size"])
            
        if "clock_scale" in data:
            self.var_clock_window_scale.set(data["clock_scale"])
            self.change_clock_window_scale(data["clock_scale"])
            
        if "banner_height" in data:
            self.var_banner_height.set(data["banner_height"])
            self.change_banner_height(data["banner_height"])
            
        if "schedule_size" in data:
            self.var_schedule_size.set(data["schedule_size"])
            self.change_schedule_size(data["schedule_size"])
            
        if "schedule_width" in data:
            self.var_schedule_width.set(data["schedule_width"])
            self.change_schedule_width(data["schedule_width"])
            
        messagebox.showinfo("Carregado", f"Preset {slot_id} carregado com sucesso!")


    def quit_app(self):
        self.root.quit()

    def switch_mode(self, new_mode):
        if new_mode == self.current_mode: return
        
        # 1. Save Current Config to Memory
        self.save_current_to_config(self.current_mode)
        
        # 2. Apply New Config
        self.current_mode = new_mode
        self.apply_mode(new_mode)
        
    def save_current_to_config(self, mode):
        cfg = self.mode_configs[mode]
        cfg["show_clock"] = self.var_show_clock.get()
        cfg["show_timer"] = self.var_show_timer.get()
        cfg["show_banner"] = self.var_show_banner.get()
        cfg["show_schedule"] = self.var_show_schedule.get()
        
        cfg["clock_size"] = self.var_clock_size.get()
        cfg["clock_scale"] = self.var_clock_window_scale.get()
        cfg["banner_height"] = self.var_banner_height.get()
        cfg["schedule_size"] = self.var_schedule_size.get()
        cfg["schedule_width"] = self.var_schedule_width.get()
        cfg["text_mode"] = self.var_text_mode.get()
        # Save positions? 
        # Ideally yes, but positions are in App. 
        # For now let's just save settings. Positions are per-monitor in App usually.
        # But wait, User might want diff positions for Streaming (Lower Third) vs Projection (Top).
        # We should save positions too if possible.
        # self.app.clock_x, self.app.banner_y...
        cfg["pos_banner_y"] = self.app.banner_y
        # ...
        
    def apply_mode(self, mode):
        cfg = self.mode_configs[mode]
        
        # WORK AREA LOGIC
        if mode == "STREAMING":
             # L-Shape: Reserve Right (Schedule/Clock) and Bottom (Banner)
             # We need explicit sizes
             r_width = cfg["schedule_width"] 
             # Or max of clock/schedule? Schedule is usually wider.
             
             b_height = cfg["banner_height"]
             
             # Apply Work Area
             work_area_mgr.set_reserve(r_width, b_height)
             
             # Monitor (Primary assumed for Streaming Work Area)
             mon_w, mon_h = work_area_mgr.get_screen_size()
             
             # 1. Banner (Bottom Full Width)
             self.app.banner_x = 0
             self.app.banner_y = mon_h - b_height
             self.app.monitor_width = mon_w
             self.app.monitor_height = mon_h
             self.app.bar_height = b_height
             
             # 2. Sidebar (Right)
             # Width = r_width
             # Calculations for Clock & Schedule
             
             # Clock position
             # We want to center it within the r_width strip at the top
             # Get actual clock dims (updated by scale config)
             # But cfg["clock_size"] is font size. 
             # We need to rely on the app to update dims based on scale OR calculate here.
             # Ideally we used the values set in the App.
             
             cw = self.app.clock_width
             ch = self.app.clock_height
             
             # Center X in the sidebar (which is from W-r_width to W)
             sidebar_start_x = mon_w - r_width
             center_offset = (r_width - cw) // 2
             self.app.clock_x = sidebar_start_x + center_offset
             self.app.clock_y = 10 # Top padding
             
             # Schedule position
             # Below clock
             self.app.schedule_x = sidebar_start_x + ((r_width - self.app.schedule_width) // 2)
             self.app.schedule_y = self.app.clock_y + ch + 20 # 20px padding below clock
             
             # Auto-Resize Schedule Height to fit remaining space
             # Max Y = Banner Y
             available_h = self.app.banner_y - self.app.schedule_y - 10 # 10px padding bottom
             if available_h < 100: available_h = 100
             
             # Resize Schedule Window
             self.app.schedule_win.geometry(f"{self.app.schedule_width}x{available_h}+{self.app.schedule_x}+{self.app.schedule_y}")
             
        else:
             # PROJECTION
             work_area_mgr.restore()
             # Restore default monitor config if possible?
             # The user might have selected a specific monitor.
             # We should re-apply the user's selected monitor from combobox
             self.change_screen()
        
        # Update Variables
        self.var_show_clock.set(cfg["show_clock"])
        self.var_show_timer.set(cfg["show_timer"])
        self.var_show_banner.set(cfg["show_banner"])
        self.var_show_schedule.set(cfg["show_schedule"])
        
        self.var_clock_size.set(cfg["clock_size"])
        self.var_clock_window_scale.set(cfg["clock_scale"])
        self.var_banner_height.set(cfg["banner_height"])
        self.var_schedule_size.set(cfg["schedule_size"])
        self.var_schedule_width.set(cfg["schedule_width"])
        self.var_text_mode.set(cfg["text_mode"])
        
        # Update App Appearance
        self.app.bg_color = cfg["bg_color"]
        self.app.root.configure(bg=cfg["bg_color"])
        self.app.label.configure(bg=cfg["bg_color"])
        
        if hasattr(self.app, 'clock_win'):
            self.app.clock_win.configure(bg=cfg["bg_color"])
            self.app.clock_label.configure(bg=cfg["bg_color"])
            self.app.timer_display.configure(bg=cfg["bg_color"])
            # Update Clock/Timer text color? Keep default?
            
        # Update App Values
        self.change_clock_font_size(cfg["clock_size"])
        self.change_clock_window_scale(cfg["clock_scale"])
        self.change_banner_height(cfg["banner_height"])
        self.change_schedule_size(cfg["schedule_size"])
        self.change_schedule_width(cfg["schedule_width"])
        
        # Update UI Buttons
        if mode == "PROJECTION":
            self.btn_mode_proj.config(bg="#4CAF50", fg="white")
            self.btn_mode_stream.config(bg="#333333", fg="gray")
        else:
             self.btn_mode_proj.config(bg="#333333", fg="gray")
             self.btn_mode_stream.config(bg="#4CAF50", fg="white")
             
        self.refresh_display()
        self.update_preview()
        
        # Notify
        # messagebox.showinfo("Modo Alterado", f"Modo alterado para {mode}")

if __name__ == "__main__":
    root = tk.Tk()
    control = ControlPanel(root)
    # Start the monitor update loop
    control.update_monitor()
    root.mainloop()
    work_area_mgr.restore() # Explicit restore on exit
