#!/usr/bin/env python3
"""
Pencil MCP Client - Apply Design to Canvas

This script connects to the Pencil MCP server and attempts to apply design operations.

ISSUE: The batch_design tool consistently returns "Error: Unexpected statement type"
regardless of the operation format used.

Formats attempted:
1. [{"type": "insert", "nodes": [...]}]
2. [{"type": "INSERT", "nodes": [...]}]
3. [{"statement": "INSERT", "nodes": [...]}]
4. [{"op": "insert", "nodes": [...]}]
5. [{"action": "insert", "nodes": [...]}]
6. Various other combinations

All formats result in the same error, suggesting either:
- The Pencil MCP server expects a very specific undocumented format
- There may be a version mismatch between the client and server
- The operations need to be pre-processed or validated differently
"""

import json
import subprocess
import sys
import threading
import time


class PencilMCPClient:
    def __init__(self, command_path):
        self.command_path = command_path
        self.process = None
        self.message_id = 0
        self.responses = {}
        self.lock = threading.Lock()
        
    def start(self):
        self.process = subprocess.Popen(
            [self.command_path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )
        self.reader_thread = threading.Thread(target=self._read_responses, daemon=True)
        self.reader_thread.start()
        print(f"[INFO] Started MCP server: {self.command_path}")
        
    def _read_responses(self):
        while self.process and self.process.poll() is None:
            try:
                line = self.process.stdout.readline()
                if line:
                    line = line.strip()
                    if line:
                        try:
                            response = json.loads(line)
                            with self.lock:
                                if 'id' in response:
                                    self.responses[response['id']] = response
                        except:
                            pass
            except:
                pass
                
    def send_request(self, method, params=None, timeout=30):
        with self.lock:
            self.message_id += 1
            msg_id = self.message_id
            
        request = {
            "jsonrpc": "2.0",
            "id": msg_id,
            "method": method,
            "params": params or {}
        }
        
        request_line = json.dumps(request) + "\n"
        self.process.stdin.write(request_line)
        self.process.stdin.flush()
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            with self.lock:
                if msg_id in self.responses:
                    response = self.responses.pop(msg_id)
                    if 'error' in response:
                        raise Exception(f"RPC Error: {response['error']}")
                    return response.get('result')
            time.sleep(0.1)
            
        raise TimeoutError(f"Request timed out")
        
    def call_tool(self, tool_name, arguments=None, timeout=30):
        params = {
            "name": tool_name,
            "arguments": arguments or {}
        }
        return self.send_request("tools/call", params, timeout)
        
    def close(self):
        if self.process:
            self.process.terminate()
            self.process.wait(timeout=5)
            if self.process.poll() is None:
                self.process.kill()
        print("[INFO] MCP server process closed")


def main():
    mcp_wrapper = "/Users/ml/.kimi/pencil-mcp-wrapper.sh"
    design_file = "/tmp/pencil_design.json"
    
    # Load design operations
    try:
        with open(design_file, 'r') as f:
            design_data = json.load(f)
        operations = design_data.get('operations', [])
        print(f"[INFO] Loaded {len(operations)} operations from {design_file}")
    except Exception as e:
        print(f"[ERROR] Failed to load design file: {e}")
        return 1
    
    client = PencilMCPClient(mcp_wrapper)
    
    try:
        client.start()
        time.sleep(1)
        
        # Step 1: Check editor state
        print("\n[STEP 1] Checking editor state...")
        try:
            editor_state = client.call_tool("get_editor_state")
            print(f"[SUCCESS] Got editor state")
        except Exception as e:
            print(f"[WARN] Could not get editor state: {e}")
        
        # Step 2: Create/open document
        print("\n[STEP 2] Creating new document...")
        try:
            result = client.call_tool("open_document", {"filePathOrTemplate": "new"})
            print(f"[SUCCESS] Document opened")
        except Exception as e:
            print(f"[ERROR] Failed to open document: {e}")
            return 1
        
        # Step 3: Apply batch design
        print("\n[STEP 3] Applying batch design operations...")
        print(f"[INFO] Operations count: {len(operations)}")
        
        # Convert operations to JSON string
        operations_json = json.dumps(operations, ensure_ascii=False)
        
        args = {
            "filePath": "pencil-new.pen",
            "operations": operations_json
        }
        
        try:
            result = client.call_tool("batch_design", args, timeout=60)
            
            if result.get('isError'):
                error_text = result['content'][0]['text'] if result.get('content') else 'Unknown error'
                print(f"\n[ERROR] Batch design failed: {error_text}")
                print("\n[NOTE] The 'Unexpected statement type' error indicates the operations format")
                print("does not match what the Pencil MCP server expects. The design file uses")
                print("the format: [{\"type\": \"insert\", \"path\": \"root\", \"nodes\": [...]}]")
                print("but the server may expect a different format.")
                return 1
            else:
                print(f"\n[SUCCESS] Design applied successfully!")
                for content in result.get('content', []):
                    print(f"[INFO] {content.get('text', '')[:800]}")
                return 0
                
        except Exception as e:
            print(f"\n[ERROR] batch_design call failed: {e}")
            return 1
        
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        client.close()


if __name__ == "__main__":
    sys.exit(main())
