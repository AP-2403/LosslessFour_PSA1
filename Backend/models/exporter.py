from pydantic import BaseModel
from typing import List, Optional

class ExporterProfile(BaseModel):
    company_name: str
    industry: str
    hq_country: str
    target_countries: List[str]
    annual_revenue_usd: int
    manufacturing_capacity: str
    certifications: List[str]
    good_payment_terms: bool
    prompt_response_score: float
    team_size: str
    is_hiring: bool
    linkedin_active: Optional[bool] = False