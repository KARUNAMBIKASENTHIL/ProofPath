import uuid
from typing import List, Dict, Any
from app.models.schemas import ProofGraphData, ProofGraphNode, ProofGraphEdge, EvidenceRecord, JobRoleDefinition, EvidenceStatus

class ProofGraphService:
    """
    Builds the ProofGraph network mapping:
    Student -> Claimed Skill -> Project -> Evidence Artifact -> Assessment Finding -> Target Role
    """

    @staticmethod
    def generate_proof_graph(
        student_name: str,
        target_role: JobRoleDefinition,
        evidence_records: List[EvidenceRecord]
    ) -> ProofGraphData:
        nodes: List[ProofGraphNode] = []
        edges: List[ProofGraphEdge] = []
        node_ids = set()

        def add_node(node_id: str, label: str, node_type: str, status: str = "", metadata: Dict[str, Any] = None):
            if node_id not in node_ids:
                nodes.append(ProofGraphNode(
                    id=node_id,
                    label=label,
                    type=node_type,
                    status=status,
                    metadata=metadata or {}
                ))
                node_ids.add(node_id)

        def add_edge(src: str, tgt: str, rel: str):
            edges.append(ProofGraphEdge(
                id=f"e-{src}-{tgt}",
                source=src,
                target=tgt,
                relationship=rel
            ))

        # Root: Student
        student_node_id = "student-root"
        add_node(student_node_id, student_name, "student", "Active Student")

        # Destination: Target Role
        role_node_id = f"role-{target_role.id}"
        add_node(role_node_id, target_role.name, "role", "Target Career", {"domain": target_role.domain})

        # Process competencies
        for idx, comp in enumerate(target_role.competencies):
            skill_node_id = f"skill-{comp.skill_id}"
            add_node(skill_node_id, comp.name, "skill", comp.category, {"weight": comp.importance_weight})
            add_edge(student_node_id, skill_node_id, "claims")

            # Find matching evidence
            matched = [
                e for e in evidence_records 
                if e.normalized_skill.lower() == comp.skill_id 
                or comp.skill_id in e.normalized_skill.lower()
                or comp.name.lower() in e.skill_name.lower()
            ]

            if matched:
                ev = matched[0]
                # Project Node
                proj_name = ev.project_name or "Resume Experience"
                proj_node_id = f"proj-{comp.skill_id}"
                add_node(proj_node_id, proj_name, "project", "Implementation Context")
                add_edge(skill_node_id, proj_node_id, "implemented_in")

                # Artifact Node
                artifact_label = ev.file_path_or_url or (ev.observed_evidence[:30] + "...")
                artifact_node_id = f"art-{comp.skill_id}"
                add_node(artifact_node_id, artifact_label, "artifact", "Code Artifact", {
                    "snippet": ev.code_snippet,
                    "url": ev.file_path_or_url
                })
                add_edge(proj_node_id, artifact_node_id, "evidenced_by")

                # Finding Node
                finding_node_id = f"find-{comp.skill_id}"
                status_val = ev.status.value
                add_node(finding_node_id, f"{status_val}", "finding", status_val, {
                    "confidence": ev.confidence,
                    "rules": ev.rules_applied
                })
                add_edge(artifact_node_id, finding_node_id, "yields_finding")
                add_edge(finding_node_id, role_node_id, "qualifies_competency")

            else:
                # Missing / Gap path
                proj_node_id = f"proj-gap-{comp.skill_id}"
                add_node(proj_node_id, "No Project Evidence", "project", "Gap")
                add_edge(skill_node_id, proj_node_id, "lacks_project")

                artifact_node_id = f"art-gap-{comp.skill_id}"
                add_node(artifact_node_id, "No Artifact Found", "artifact", "Missing Artifact")
                add_edge(proj_node_id, artifact_node_id, "missing_evidence")

                finding_node_id = f"find-gap-{comp.skill_id}"
                add_node(finding_node_id, "Not Yet Verified", "finding", EvidenceStatus.NOT_YET_VERIFIED.value, {
                    "rule": "RULE_UNVERIFIED: Zero matching artifacts in workspace."
                })
                add_edge(artifact_node_id, finding_node_id, "yields_finding")
                add_edge(finding_node_id, role_node_id, "unmet_requirement")

        return ProofGraphData(nodes=nodes, edges=edges)
