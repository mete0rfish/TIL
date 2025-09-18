#include <stdio.h>
#include <string.h>

int main () {
  int auth = 0;
  char passwd[20]; 

  printf("패스워드: ");
  gets(passwd);

  if(strcmp(passwd, "passkey") == 0)
    auth = 1;

  if(auth)
    printf("인증 성공!\n");
  else
    printf("인증 실패!\n");
}
