alter table messages add column if not exists input_cost numeric;                                                         
alter table messages add column if not exists output_cost numeric;                                                        
alter table messages add column if not exists cache_read_cost numeric;                                                    
alter table messages add column if not exists cache_write_cost numeric;                                                   
alter table messages add column if not exists total_cost numeric; 