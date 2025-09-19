#!/bin/bash

TODO_FILE="$HOME/.todo_list.txt"

touch "$TODO_FILE"

function usage() {
    echo "Usage: $0 [add|list|remove|clear] [item]"
    echo "Commands:"
    echo "  add [item]     Add a new item to the to-do list"
    echo "  list           List all to-do items"
    echo "  remove [num]   Remove the item with the given number"
    echo "  clear          Clear all items from the to-do list"
    exit 1
}

function list_tasks() {
    echo "✅ To-Do List"
    echo "----------------"

    if [[ ! -s "$TODO_FILE" ]]; then
        echo "No tasks in the to-do list."
    else
        sed '/^$/d' "$TODO_FILE" | cat -n
    fi
    echo "----------------"
}

case "$1" in
    add)
        if [ -z "$2" ]; then
            echo "Error: No item provided to add."
            usage
        fi
        echo "$2" >> "$TODO_FILE"
        echo "Added: $2"
        ;;
    list)
        list_tasks
        ;;
    done)
        if [ -z "$2" ]; then
            echo "Error: No item number provided to mark as done."
            usage
        fi
        sed -i.bak "${2}s/^/completed: /" "$TODO_FILE"
        echo "Completed item number: $2"
        ;;
    del)
        if [ -z "$2" ]; then
            echo "Error: No item number provided to delete."
            usage
        fi
        sed -i.bak "${2}d" "$TODO_FILE"
        echo "Deleted item number: $2"
        ;;
    clear)
        > "$TODO_FILE"
        echo "Cleared all items from the to-do list."
        ;;
    *)
        usage
        ;;
esac