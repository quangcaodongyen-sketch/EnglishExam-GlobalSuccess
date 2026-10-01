import os
import sys
import re
import json
import asyncio
import base64
import edge_tts

ROOT_DIR = r"c:\Users\Admin\Desktop\web Tieng Anh"
AUDIO_DIR = os.path.join(ROOT_DIR, "audio")
TEMP_DIR = os.path.join(AUDIO_DIR, "temp_build")
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

# Import chimes from Smart Listening Pro
sys.path.append(os.path.join(ROOT_DIR, r"Text To Speech\Phien_Ban_2_Online_Cloud\Client_App"))
try:
    from chimes_data import ACOUSTIC_CHIME_JINGLE_B64, ACOUSTIC_BELL_B64
    CHIME_BYTES = base64.b64decode(ACOUSTIC_CHIME_JINGLE_B64)
    BELL_BYTES = base64.b64decode(ACOUSTIC_BELL_B64)
except Exception as e:
    print("Warning: chimes_data not loaded:", e)
    CHIME_BYTES = b""
    BELL_BYTES = b""

def generate_silence_mp3_bytes(duration_sec: float) -> bytes:
    frame_header = b'\xff\xf3\x64\xc4'
    frame_body = b'\x00' * (288 - len(frame_header))
    silent_frame = frame_header + frame_body
    num_frames = max(1, int(round(duration_sec * 41.6667)))
    return silent_frame * num_frames

VOICE_NARRATOR = "en-US-AvaNeural"
VOICE_MALE = "en-US-AndrewNeural"
VOICE_FEMALE = "en-US-JennyNeural"

async def synthesize_part(text, voice, out_path, rate="-3%", pitch="+0Hz"):
    comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await comm.save(out_path)

def parse_script_blocks(script_text):
    # Splits script into Part 1 (Dialogue) and Part 2 (Monologue)
    lines = script_text.strip().split('\n')
    blocks = []
    current_part = "Part 1"
    
    for line in lines:
        line_s = line.strip()
        if not line_s:
            continue
        if "PART 1" in line_s.upper():
            current_part = "Part 1"
            continue
        if "PART 2" in line_s.upper():
            current_part = "Part 2"
            continue
            
        # Match speaker : speech
        m = re.match(r'^([^:\n]+):\s*(.+)$', line_s)
        if m:
            spk = m.group(1).strip()
            text = m.group(2).strip()
            blocks.append((current_part, spk, text))
        else:
            # Monologue line or unlabelled text
            blocks.append((current_part, "Monologue", line_s))
            
    return blocks

async def build_exam_audio(grade, term, script_text, out_filename):
    print(f"\n==========================================")
    print(f"Building Listening Audio for Grade {grade} {term}...")
    final_mp3 = os.path.join(AUDIO_DIR, out_filename)
    
    blocks = parse_script_blocks(script_text)
    print(f"Parsed {len(blocks)} speech items.")
    
    part1_items = [b for b in blocks if b[0] == "Part 1"]
    part2_items = [b for b in blocks if b[0] == "Part 2"]
    
    session_id = f"{grade}_{term.lower()}"
    part_files = {}
    
    counter = 0
    # Synthesize each unique part
    async def process_item(p_id, spk, text):
        out_p = os.path.join(TEMP_DIR, f"{session_id}_{p_id}.mp3")
        if "NARRATOR" in spk.upper():
            v = VOICE_NARRATOR
            r, p = "-4%", "+1Hz"
        elif any(f_name in spk.upper() for f_name in ["MAI", "MI", "TRANG", "LAN", "LINDA", "MARY", "SARAH", "FEMALE"]):
            v = VOICE_FEMALE
            r, p = "-3%", "+2Hz"
        elif any(m_name in spk.upper() for m_name in ["NAM", "PHONG", "MARK", "TOM", "PETER", "NICK", "MALE"]):
            v = VOICE_MALE
            r, p = "-3%", "-2Hz"
        else: # Monologue speaker
            v = VOICE_NARRATOR
            r, p = "-4%", "+0Hz"
            
        print(f"  [{p_id}] {spk} ({v}): {text[:45]}...")
        await synthesize_part(text, v, out_p, rate=r, pitch=p)
        part_files[p_id] = out_p

    # Synthesize transition "Now listen again."
    listen_again_path = os.path.join(TEMP_DIR, f"{session_id}_listen_again.mp3")
    await synthesize_part("Now listen again.", VOICE_NARRATOR, listen_again_path, rate="-5%", pitch="+1Hz")

    # Synthesize outro
    outro_path = os.path.join(TEMP_DIR, f"{session_id}_outro.mp3")
    await synthesize_part("That is the end of the listening section.", VOICE_NARRATOR, outro_path, rate="-5%", pitch="+1Hz")

    for idx, item in enumerate(blocks):
        await process_item(f"item_{idx}", item[1], item[2])
        
    print("All parts synthesized! Merging with studio format...")
    
    # Silence chunks
    silence_short = generate_silence_mp3_bytes(0.8) # between dialogue turns
    silence_section = generate_silence_mp3_bytes(2.5) # between parts
    silence_repeat = generate_silence_mp3_bytes(2.0) # between repeats
    
    with open(final_mp3, "wb") as out_f:
        # 1. Chime intro
        if CHIME_BYTES:
            out_f.write(CHIME_BYTES)
            out_f.write(generate_silence_mp3_bytes(1.2))
            
        # 2. PART 1 (Dialogue)
        # First reading
        p1_indices = [idx for idx, b in enumerate(blocks) if b[0] == "Part 1"]
        for idx in p1_indices:
            p_id = f"item_{idx}"
            if p_id in part_files and os.path.exists(part_files[p_id]):
                with open(part_files[p_id], "rb") as pf:
                    out_f.write(pf.read())
                out_f.write(silence_short)
                
        # "Now listen again."
        out_f.write(silence_repeat)
        with open(listen_again_path, "rb") as pf:
            out_f.write(pf.read())
        out_f.write(silence_repeat)
        
        # Second reading of Part 1 (omit narrator instructions, just the dialogue)
        for idx in p1_indices:
            if "NARRATOR" in blocks[idx][1].upper():
                continue
            p_id = f"item_{idx}"
            if p_id in part_files and os.path.exists(part_files[p_id]):
                with open(part_files[p_id], "rb") as pf:
                    out_f.write(pf.read())
                out_f.write(silence_short)
                
        out_f.write(silence_section)
        
        # 3. PART 2 (Monologue)
        p2_indices = [idx for idx, b in enumerate(blocks) if b[0] == "Part 2"]
        for idx in p2_indices:
            p_id = f"item_{idx}"
            if p_id in part_files and os.path.exists(part_files[p_id]):
                with open(part_files[p_id], "rb") as pf:
                    out_f.write(pf.read())
                out_f.write(silence_short)
                
        # "Now listen again."
        out_f.write(silence_repeat)
        with open(listen_again_path, "rb") as pf:
            out_f.write(pf.read())
        out_f.write(silence_repeat)
        
        # Second reading of Part 2
        for idx in p2_indices:
            if "NARRATOR" in blocks[idx][1].upper():
                continue
            p_id = f"item_{idx}"
            if p_id in part_files and os.path.exists(part_files[p_id]):
                with open(part_files[p_id], "rb") as pf:
                    out_f.write(pf.read())
                out_f.write(silence_short)
                
        # 4. Outro + Bell
        out_f.write(silence_section)
        with open(outro_path, "rb") as pf:
            out_f.write(pf.read())
        out_f.write(generate_silence_mp3_bytes(1.0))
        if BELL_BYTES:
            out_f.write(BELL_BYTES)
            
    print(f"SUCCESS: Final Listening Audio created at: {final_mp3}")
    print(f"File size: {os.path.getsize(final_mp3):,} bytes")
    return final_mp3

async def main():
    # Read scripts from scratch/all_gk1_scripts.json
    scripts_file = r"C:\Users\Admin\.gemini\antigravity-ide\brain\119fdd55-6d46-415a-a604-1722ef787195\scratch\all_gk1_scripts.json"
    if os.path.exists(scripts_file):
        with open(scripts_file, "r", encoding="utf-8") as f:
            all_scripts = json.load(f)
    else:
        all_scripts = {}

    for grade in ["6", "7", "8", "9"]:
        script = all_scripts.get(grade)
        if not script:
            print(f"No script found for Grade {grade}")
            continue
        out_name = f"listening_{grade}_gk1.mp3"
        out_path = os.path.join(AUDIO_DIR, out_name)
        if grade == "8" and os.path.exists(out_path) and os.path.getsize(out_path) > 500000:
            print(f"Grade 8 GK1 audio already generated ({os.path.getsize(out_path):,} bytes). Skipping.")
            continue
        try:
            await build_exam_audio(grade, "GK1", script, out_name)
        except Exception as e:
            print(f"Error building Grade {grade}: {e}")

if __name__ == "__main__":
    asyncio.run(main())
