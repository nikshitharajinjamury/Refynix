import ast
import json
import re
from typing import Dict, Any, List, Optional

class VisualizationModule:
    """
    Refynix Visualization Module
    Generates side-by-side metrics, Mermaid flowcharts, and AST comparisons.
    """

    def __init__(self):
        pass

    def extract_metrics(self, code_before: str, code_after: str, language: str) -> Dict[str, Any]:
        """
        Extracts 'before' and 'after' metrics for cyclomatic complexity, memory, and time.
        """
        metrics = {
            "complexity": {"before": 0, "after": 0, "unit": "CC"},
            "memory": {"before": 0, "after": 0, "unit": "KB"},
            "time": {"before": 0, "after": 0, "unit": "ms"}
        }

        if language.lower() == "python":
            metrics["complexity"]["before"] = self._calculate_complexity(code_before)
            metrics["complexity"]["after"] = self._calculate_complexity(code_after)
            
            # Heuristics for memory and time based on code volume and common patterns
            metrics["memory"]["before"] = self._estimate_memory(code_before)
            metrics["memory"]["after"] = self._estimate_memory(code_after)
            metrics["time"]["before"] = self._estimate_time(code_before)
            metrics["time"]["after"] = self._estimate_time(code_after)
        else:
            # Fallback for other languages
            metrics["complexity"]["before"] = len(re.findall(r'(if|for|while|case|&\b|\|\b)', code_before)) + 1
            metrics["complexity"]["after"] = len(re.findall(r'(if|for|while|case|&\b|\|\b)', code_after)) + 1
            metrics["memory"]["before"] = len(code_before) // 100
            metrics["memory"]["after"] = len(code_after) // 100
            metrics["time"]["before"] = len(code_before) // 50
            metrics["time"]["after"] = len(code_after) // 50

        return metrics

    def generate_mermaid_flowchart(self, code_before: str, code_after: str) -> str:
        """
        Generates a basic Mermaid flowchart string comparing structural changes.
        """
        # Simple logic to identify blocks (very simplified for demo)
        def get_simplified_flow(code):
            blocks = []
            if "if" in code: blocks.append("ConditionCheck")
            if "for" in code or "while" in code: blocks.append("LoopIteration")
            blocks.append("ReturnResult")
            return blocks

        flow_before = get_simplified_flow(code_before)
        flow_after = get_simplified_flow(code_after)

        mermaid = "graph LR\n"
        mermaid += "  subgraph Original\n"
        for i in range(len(flow_before) - 1):
            mermaid += f"    B{i}[{flow_before[i]}] --> B{i+1}[{flow_before[i+1]}]\n"
        mermaid += "  end\n"
        
        mermaid += "  subgraph Optimized\n"
        for i in range(len(flow_after) - 1):
            mermaid += f"    A{i}[{flow_after[i]}] --> A{i+1}[{flow_after[i+1]}]\n"
        mermaid += "  end\n"

        return mermaid

    def generate_plotly_json(self, metrics: Dict[str, Any]) -> str:
        """
        Generates JSON structure for Plotly bar charts.
        """
        data = {
            "labels": ["Complexity", "Memory", "Time"],
            "before": [metrics["complexity"]["before"], metrics["memory"]["before"], metrics["time"]["before"]],
            "after": [metrics["complexity"]["after"], metrics["memory"]["after"], metrics["time"]["after"]]
        }
        return json.dumps(data)

    def generate_ast_comparison(self, code_before: str, code_after: str, language: str) -> Dict[str, Any]:
        """
        Generates AST tree structure highlighting pruned nodes (Python only for now).
        """
        if language.lower() != "python":
            return {"error": "AST visualization only supported for Python."}

        try:
            tree_before = ast.parse(code_before)
            tree_after = ast.parse(code_after)

            def get_signature(node: ast.AST):
                return f"{type(node).__name__}:{ast.dump(node)}"

            after_signatures = set()
            for node in ast.walk(tree_after):
                after_signatures.add(get_signature(node))

            def tree_to_dict(node: ast.AST, is_before: bool = False):
                sig = get_signature(node)
                is_pruned = is_before and sig not in after_signatures
                
                return {
                    "name": type(node).__name__,
                    "pruned": is_pruned,
                    "children": [tree_to_dict(c, is_before) for c in ast.iter_child_nodes(node)]
                }

            return {
                "before": tree_to_dict(tree_before, is_before=True),
                "after": tree_to_dict(tree_after, is_before=False)
            }
        except Exception as e:
            return {"error": str(e)}

    def calculate_efficiency_score(self, metrics: Dict[str, Any]) -> float:
        """
        Calculates a summary score based on the delta of resource consumption.
        """
        def get_delta(m: Dict[str, Any]) -> float:
            if m["before"] == 0: return 0.0
            return float(m["before"] - m["after"]) / float(m["before"])

        c_delta = get_delta(metrics["complexity"])
        m_delta = get_delta(metrics["memory"])
        t_delta = get_delta(metrics["time"])

        avg_delta = (c_delta + m_delta + t_delta) / 3.0
        score = max(0.0, min(100.0, (avg_delta * 100.0) + 50.0))
        return round(float(score), 2)

    def _calculate_complexity(self, code: str) -> int:
        try:
            tree = ast.parse(code)
            complexity = 1
            for node in ast.walk(tree):
                if isinstance(node, (ast.If, ast.While, ast.For, ast.And, ast.Or)):
                    complexity += 1
            return int(complexity)
        except:
            return 1

    def _estimate_memory(self, code: str) -> int:
        # Heuristic: Count variables and data structures
        vars = len(re.findall(r'(\w+)\s*=', code))
        lists = code.count('[') + code.count('{')
        return (vars * 4) + (lists * 24) + 10 # Base KB

    def _estimate_time(self, code: str) -> int:
        # Heuristic: Count loops and nesting
        loops = code.count('for ') + code.count('while ')
        nesting = len(re.findall(r'\n(    )+for', code))
        return (loops * 10) * (2 ** nesting) + 1
