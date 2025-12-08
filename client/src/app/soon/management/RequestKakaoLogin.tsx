"use client"

import { Button, Stack } from "@mui/material"

interface RequestKakaoLoginProps {
    userId: string;
}


export default function RequestKakaoLogin({ userId }: RequestKakaoLoginProps) {
  
  function handleKakaoLoginRequest() {
    const url = `${window.location.origin}/kakaoLogin?userId=${userId}`;
    if(navigator.share){
        navigator.share({
            title: '카카오 로그인 연결',
            url: url,
        })
    }else{
        window.open(url, '_blank');
    }
  }
  
  return <Stack>
    <Button variant="outlined" onClick={handleKakaoLoginRequest}>
        카카오 연결 요청
    </Button>
  </Stack>
}