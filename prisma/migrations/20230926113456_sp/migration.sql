create function user_has_password_auto_update() returns trigger
language plpgsql as $$
begin
    if new."password" is not null then
        new."hasPassword" := true;
    end if;

    return new;
end;
$$;

create trigger "user_has_password_autoupdate"
before insert or update
on "User"
for each row
execute procedure user_has_password_auto_update();