# may i contribute?
yes of course. if you want to contribute, just fork the repository, make your changes, and then open a pull request.

# is there any format i should follow for my code?
there isn't much at the moment, but we do use eslint. 

additionally, we would appreciate it if imports were organized in the following order (seperated by a blank line):
1. node built-in modules
2. external modules
3. internal modules
4. types (use `import type` as well)

# what should my git commit message look like?
please follow the conventional commit format with an optional scope. for example:
```
feat: add new feature
fix: fix a bug
chore(deps): update dependencies
```

# how do i run tests?
to run tests, you can run the following commands:
```bash
pnpm build # build the project first

pnpm test # run tests
```