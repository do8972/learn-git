# learn-git
git 내부 객체를 이해하기 위해 만드는 프로젝트.

Git Internals
-----------------------
#### Git Object

    $ git init test
    Initialized empty Git repository in /tmp/test/.git/
    $ cd test
    $ find .git/objects
    .git/objects
    .git/objects/info
    .git/objects/pack
    $ find .git/objects -type f

------
##### git add 
content를 SHA1(40자)으로 hash를 하여 앞 2글자는 directory를 만들고, 나머지 글자로 파일을 만든다.
또한 content를 압축을 하여 파일의 내용으로 들어가게 된다.




------
[Reference](https://git-scm.com/book/en/v2)
