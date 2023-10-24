## 1. MySQL to Mongo

- criar collection employees no MongoDB

- Documentos devem agregar todas as informacoes de um employee, incluindo
    - salaries
    - titles
    - departments
    - dep_manager

- Respeitando as devidas cardinalidades!!

- Fazer uma funcao para buscar os dados no MySql e carregar no MongoDB. Ela deve poder ser executada sem duplicar dados!
    - Paras isso da de utilizar indices !! ( ou buscar antes de colocar, mas indices melhor)


## 2. So Mongo
 - Retorne todos os employees dado o nome ou ID do **MANAGER**
 - Dado um title, recupere todos os employees que ja estiveram vinculados a esse title
 - Dado um departamento, retorne todos os employees vinculados ao departamento
 - Retornar a media salarial de todos os employees **Por Departamento**

 ## 3. Criar Indices para atender as consultas solicitadas no item dois (fazer antes do dois cpa (?) )
 Indexar
 - Employee Id (Como indice unico deve ser indexado)
 - Title
 - Manager Id
 - Departamento
