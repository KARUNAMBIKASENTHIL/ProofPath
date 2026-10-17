from fastapi import APIRouter, Body
from typing import Dict, Any, List
from app.services.mcp_client import mcp_client

router = APIRouter(prefix="/mcp", tags=["Model Context Protocol (MCP) Integration"])

@router.get("/tools")
async def list_mcp_tools():
    """Returns available MCP tools complying with MCP JSON-RPC protocol."""
    return {
        "status": "ready",
        "mcp_active": mcp_client.is_mcp_active,
        "tools": mcp_client.get_available_tools(),
        "notes": "When MCP server daemon is active, executes via JSON-RPC 2.0. Otherwise routes through designated GitHub API adapter fallback with clear provenance tags."
    }

@router.post("/tools/call")
async def call_mcp_tool(
    name: str = Body(..., embed=True),
    arguments: Dict[str, Any] = Body(default={}, embed=True)
):
    """Executes an MCP tool call with explicit provenance and safety controls."""
    return await mcp_client.invoke_tool(name, arguments)
