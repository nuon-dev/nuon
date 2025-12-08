"use client"

import { Button } from "@mui/material"
import { useRouter } from "next/navigation"



export default function VotePage() {
    const {push} = useRouter()


    return <div>Vote Page
    <Button variant="outlined" onClick={() => push('/kakaoLogin')}>
        관리 페이지로 이동
    </Button>

    </div>
}